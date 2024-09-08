import ExtensionSelect from '../components/notes/ExtensionSelect';
import KeySelect from '../components/notes/KeySelect';
import styles from './Notes.module.scss';
import Notation from '../components/svg/notation/Notation';
import ChordSymbol from '../components/chord/ChordSymbol';
import { Chord } from '../@types';
import { useContext } from 'react';
import { ChordsContext } from '../context/ChordsContext';
import { getNotes } from '../data/noteFunctions';

const Notes = () => {
  const { state } = useContext(ChordsContext);

  const key = state.notationKey;
  const extension = state.notationExtension;

  const chord: Chord = {
    key,
    extension,
    notes: getNotes(key, extension),
  };

  return (
    <div className={styles.notes}>
      <div className={styles.notation}>
        <Notation notes={chord.notes} />
      </div>
      <div className={styles.chord}>
        <ChordSymbol chord={chord} size={2.5} />
      </div>
      <div className={styles.select}>
        <KeySelect />
        <ExtensionSelect />
      </div>
    </div>
  );
};

export default Notes;
