import { Dispatch, FC, ReactNode, createContext, useReducer } from 'react';
import {
  AccidentalLevel,
  DifficultyLevel,
  MajorOrMinor,
  ProgramState,
  ReducerAction,
} from '../@types';
import {
  accidentalLevels,
  difficultyLevels,
  generateChords,
  generateExtensionsShuffled,
  generateKeysShuffled,
} from '../functions/chordFunctions';
import { keysOrganized } from '../data/chordData';
import { changeEnharmonically } from '../functions/noteFunctions';

const initialState = (): ProgramState => {
  let state: ProgramState = {
    // player
    isMuted: false,
    difficultyMin: 'easy',
    difficultyMax: 'medium',
    accidentalsMin: '0',
    accidentalsMax: '7',
    showRandomTopNote: true,
    randomTopNoteIndexRange: { min: 7, max: 14 }, // C2 to C3
    chordIndex: 0,
    beatsPerChord: '4',
    beatsPerMinute: '86',
    beat: 0,
    keyLocked: false,
    extensionLocked: false,

    // notation
    notationKey: { base: 'C', accidental: undefined },
    notationExtension: { isMinor: false, segments: ['7'] },

    // player: generate these below
    majorsShuffled: { fresh: [], used: [] },
    minorsShuffled: { fresh: [], used: [] },
    extensionsShuffled: { fresh: [], used: [] },
    chords: [],
  };
  state = {
    ...state,
    ...generateKeysShuffled(state),
    ...generateExtensionsShuffled(state),
  };
  state = {
    ...state,
    ...generateChords({ number: 2, state }),
  };
  return state;
};

const getStateWithUpdatedRangeAndChords = <T,>({
  action,
  payloadKey,
  state,
  stateKey,
  list,
  inverse,
}: {
  action: ReducerAction;
  payloadKey: keyof ProgramState;
  state: ProgramState;
  stateKey: keyof ProgramState;
  list: T[];
  inverse: boolean;
}): ProgramState => {
  const payloadValue = action.payload![payloadKey] as T;
  const stateValue = state[stateKey] as T;
  const payloadValueIsGreateThanStateValue =
    list.indexOf(payloadValue) > list.indexOf(stateValue);
  let newStateValue = stateValue;
  if (inverse !== payloadValueIsGreateThanStateValue) {
    newStateValue = payloadValue;
  }
  let newState = {
    ...state,
    [payloadKey]: payloadValue,
    [stateKey]: newStateValue,
  };
  newState = {
    ...newState,
    ...generateKeysShuffled(newState),
    ...generateExtensionsShuffled(newState),
  };
  newState = {
    ...newState,
    ...generateChords({ number: 2, state: newState }),
    chordIndex: 0,
  };
  return newState;
};

const reducer = (state: ProgramState, action: ReducerAction): ProgramState => {
  switch (action.type) {
    /// SETTINGS
    case 'SET_BPC': {
      const bpc = action.payload!.beatsPerChord!;
      return {
        ...state,
        beatsPerChord: bpc,
        beat: bpc === '1' ? 1 : 0,
      };
    }
    case 'SET_BPM': {
      return { ...state, beatsPerMinute: action.payload!.beatsPerMinute! };
    }
    case 'SET_MUTED': {
      return { ...state, isMuted: action.payload!.isMuted! };
    }
    case 'SET_DIFFICULTY_MIN': {
      // first create a random list of available extensions
      // reset the favorites list

      return getStateWithUpdatedRangeAndChords<DifficultyLevel>({
        action,
        payloadKey: 'difficultyMin',
        state,
        stateKey: 'difficultyMax',
        list: difficultyLevels,
        inverse: false,
      });
    }
    case 'SET_DIFFICULTY_MAX': {
      return getStateWithUpdatedRangeAndChords<DifficultyLevel>({
        action,
        payloadKey: 'difficultyMax',
        state,
        stateKey: 'difficultyMin',
        list: difficultyLevels,
        inverse: true,
      });
    }
    case 'SET_ACCIDENTALS_MIN': {
      return getStateWithUpdatedRangeAndChords<AccidentalLevel>({
        action,
        payloadKey: 'accidentalsMin',
        state,
        stateKey: 'accidentalsMax',
        list: accidentalLevels,
        inverse: false,
      });
    }
    case 'SET_ACCIDENTALS_MAX': {
      return getStateWithUpdatedRangeAndChords<AccidentalLevel>({
        action,
        payloadKey: 'accidentalsMax',
        state,
        stateKey: 'accidentalsMin',
        list: accidentalLevels,
        inverse: true,
      });
    }
    case 'RESET_SETTINGS': {
      return initialState();
    }

    //
    /// PLAYER
    case 'SET_BEAT': {
      return { ...state, beat: action.payload!.beat! };
    }
    case 'INCREMENT_BEAT': {
      return { ...state, beat: state.beat + 1 };
    }
    case 'APPEND_CHORD_LIST': {
      return {
        ...state,
        ...generateChords({ number: 1, state, append: true }),
        chordIndex: state.chordIndex + 1,
      };
    }
    case 'INCREMENT_CHORD_INDEX': {
      return { ...state, chordIndex: state.chordIndex + 1 };
    }
    case 'DECREMENT_CHORD_INDEX': {
      return { ...state, chordIndex: state.chordIndex - 1 };
    }
    case 'SWITCH_KEY_LOCK': {
      const chords = state.chords.slice(state.chordIndex, state.chordIndex + 2);
      if (!state.keyLocked) {
        chords[1].key = chords[0].key;
      }
      return {
        ...state,
        chords,
        keyLocked: !state.keyLocked,
        chordIndex: 0,
      };
    }
    case 'SWITCH_EXTENSION_LOCK': {
      const chords = state.chords.slice(state.chordIndex, state.chordIndex + 2);
      if (!state.extensionLocked) {
        chords[1].extension = chords[0].extension;
      }
      return {
        ...state,
        chords,
        extensionLocked: !state.extensionLocked,
        chordIndex: 0,
      };
    }
    case 'TOGGLE_SHOW_RANDOM_TOP_NOTE': {
      return {
        ...state,
        showRandomTopNote: !state.showRandomTopNote,
      };
    }

    //
    // NOTATION
    case 'SET_NOTATION_KEY': {
      // Check that Key exists in minor/major
      // and change extension if necessary
      const notationKey = action.payload!.notationKey!;
      const keyString =
        notationKey.base +
        (notationKey.accidental ? notationKey.accidental : '');
      const extension = state.notationExtension;
      const majorOrMinor: MajorOrMinor = extension.isMinor ? 'minor' : 'major';
      let keyExists = false;
      for (const accidentalLevel of Object.keys(keysOrganized)) {
        const keys =
          keysOrganized[accidentalLevel as AccidentalLevel][majorOrMinor];
        if (keys.includes(keyString)) {
          keyExists = true;
        }
      }
      return {
        ...state,
        notationKey,
        notationExtension: keyExists
          ? extension
          : { isMinor: !extension.isMinor, segments: [] },
      };
    }
    case 'SET_NOTATION_EXTENSION': {
      // Check that Key exists in minor/major
      // and change Key enharmonically if necessary
      const notationExtension = action.payload!.notationExtension!;
      const key = state.notationKey;
      const keyString = key.base + (key.accidental ? key.accidental : '');
      const majorOrMinor: MajorOrMinor = notationExtension.isMinor
        ? 'minor'
        : 'major';
      let keyExists = false;
      for (const accidentalLevel of Object.keys(keysOrganized)) {
        const keys =
          keysOrganized[accidentalLevel as AccidentalLevel][majorOrMinor];
        if (keys.includes(keyString)) {
          keyExists = true;
        }
      }
      return {
        ...state,
        notationKey: keyExists ? key : changeEnharmonically(key),
        notationExtension,
      };
    }

    default: {
      return state;
    }
  }
};

export const ChordsContext = createContext<{
  state: ProgramState;
  dispatch: Dispatch<ReducerAction>;
}>({
  state: initialState(),
  dispatch: () => {},
});

const ChordsContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState());
  return (
    <ChordsContext.Provider value={{ state, dispatch }}>
      {children}
    </ChordsContext.Provider>
  );
};

export default ChordsContextProvider;
