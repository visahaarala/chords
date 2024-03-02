import { useContext, useEffect, useState } from 'react';
import { Context } from '../context/Context';
import { generateChords } from '../data/harmonies';
import { useMetronome } from '../hooks/useMetronome';
import Chord from './Chord';

const PlayControls = () => {
  const ctx = useContext(Context);
  const [chordList, setChordList] = ctx.chordListState;
  const [chordIndex, setChordIndex] = ctx.chordIndexState;
  const [beatsPerMinute] = ctx.beatsPerMinuteState;
  const [beatsPerChord] = ctx.beatsPerChordState;
  const [play, setPlay] = useState<boolean>(false);
  const [beat, setBeat] = useState(0);

  // props for generating chord, defined in
  // accidentals and difficulty level
  const generatorProps = {
    extensionLevels: ctx.extensionLevelsState[0],
    accidentalLevels: ctx.accidentalLevelsState[0],
  };

  // reset chord list when chord settings are changed
  useEffect(() => {
    setChordList(generateChords({ ...generatorProps, numberOfChords: 2 }));
    setChordIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.extensionLevelsState[0], ctx.accidentalLevelsState[0]]);

  // increment chord index,
  // add new chords to array if necessary
  const nextHandler = () => {
    if (chordIndex >= chordList.length - 2) {
      setChordList((prevList) => [
        ...prevList,
        generateChords({ ...generatorProps, numberOfChords: 1 })[0],
      ]);
    }
    setChordIndex((prevIndex) => prevIndex + 1);
  };

  // decrement chord index unless it is 0
  const previousHandler = () => {
    if (chordIndex > 0) setChordIndex((prevIndex) => prevIndex - 1);
    // setBeat(1);
  };

  useMetronome({
    callBack: () => {
      if (play) {
        const playButton = document.getElementById('play')!;
        playButton.style.filter = 'brightness(2.5)';
        setTimeout(() => {
          playButton.style.filter = 'brightness(1)';
          if (beat !== 0 && beat % beatsPerChord === 0) {
            nextHandler();
            setBeat(1);
          } else {
            setBeat((prevBeat) => prevBeat + 1);
          }
        }, 50);
      }
    },
    delay: play ? (60 / beatsPerMinute) * 1000 : undefined,
  });

  return (
    <div className='section'>
      <div className='buttons'>
        <div>
          <button onClick={nextHandler} className='next' id='next'>
            Next
          </button>
          <div>
            <button onClick={previousHandler}>Previous</button>
            <div>
              <button
                onClick={() => {
                  setPlay(!play);
                }}
                id='play'
              >
                {!play ? 'Play' : 'Stop'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayControls;
