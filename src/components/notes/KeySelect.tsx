import { Accidental, Alphabet, Key } from '../../@types';
import { keyToString, stringToKey } from '../../data/chordFunctions';
import Select from '../misc/Select';

const KeySelect = () => {
  const baseOptions: Alphabet[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  const accidentalOptions: Accidental[] = ['b', undefined, '#'];

  const keyOptions: Key[] = baseOptions
    .map((base) =>
      accidentalOptions.map((accidental) => {
        return { base, accidental };
      })
    )
    .flat()
    // there are no such keys like Fb, E# or B#
    .filter((key) => !(key.base === 'F' && key.accidental === 'b'))
    .filter((key) => !(key.base === 'E' && key.accidental === '#'))
    .filter((key) => !(key.base === 'B' && key.accidental === '#'));

  return (
    <Select
      dispatchActionType='SET_NOTATION_KEY'
      payloadKey='notationKey'
      options={keyOptions}
      optionToString={keyToString}
      stringToOption={stringToKey}
    />
  );
};

export default KeySelect;
