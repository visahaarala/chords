import styles from './Metronome.module.scss';

import { useContext, useEffect, useState } from 'react';
import { useMetronome } from '../hooks/useMetronome';
import { MetronomeContext } from '../context/MetronomeContext';
import DisplaySleepComment from '../components/misc/PlayInstructions';
import MetronomeLight from '../components/metronome/MetronomeLight';
import MetronomeMute from '../components/metronome/MetronomeMute';

const min = 20;
const max = 300;

const Metronome = () => {
  const isMobile = matchMedia('(pointer:coarse)').matches;

  const ctx = useContext(MetronomeContext);
  const [tempo, setTempo] = ctx.tempoState;
  const [isMuted] = ctx.mutedState;
  const [flashIsOn] = ctx.flashState;

  const [play, setPlay] = useState(false);
  const [delay, setDelay] = useState<number>();

  const keyDownHandler = (code: string) => {
    if (code === 'Space' || code === 'Enter') {
      setPlay(!play);
    }
    if (code === 'ArrowUp') tempoUp(10);
    if (code === 'ArrowRight') tempoUp(1);
    if (code === 'ArrowDown') tempoDown(10);
    if (code === 'ArrowLeft') tempoDown(1);
  };

  const tempoUp = (number: number) => {
    const newTempo = tempo + number > max ? max : tempo + number;
    setTempo(newTempo);
  };

  const tempoDown = (number: number) => {
    const newTempo = tempo - number < min ? min : tempo - number;
    setTempo(newTempo);
  };

  const rangeHandler = (number: string) => {
    setTempo(Number(number));
  };

  useEffect(() => {
    if (play) {
      setDelay((1000 * 60) / tempo);
    } else {
      setDelay(undefined);
    }
  }, [tempo, play]);

  useMetronome({
    callBack: () => {
      if (flashIsOn) {
        document.getElementById('container')!.style.filter =
          'invert(100%) hue-rotate(180deg) brightness(.8)';
      } else {
        document.getElementById('metronomeStart')!.style.filter =
          'brightness(2)';
      }
      setTimeout(() => {
        if (flashIsOn) {
          document.getElementById('container')!.style.filter =
            'invert(0) hue-rotate(0) brightness(1)';
        } else {
          document.getElementById('metronomeStart')!.style.filter =
            'brightness(1)';
        }
      }, 100);
    },
    delay,
    isMuted,
  });

  return (
    <>
      <div className={styles.metronome}>
        <DisplaySleepComment />
        <div
          className={`${styles.tempo} ${
            play && !isMobile ? styles.tempo__play : ''
          }`}
          tabIndex={!isMobile ? 0 : -1}
          onKeyDown={(e) => keyDownHandler(e.code)}
          onClick={!isMobile ? setPlay.bind(null, !play) : () => {}}
        >
          {tempo}
        </div>
        {isMobile ? (
          <input
            className={styles.range}
            tabIndex={-1}
            type='range'
            value={tempo}
            onChange={(e) => rangeHandler(e.target.value)}
            min={min}
            max={max}
          />
        ) : (
          ''
        )}
        <div className={styles.grid}>
          {isMobile ? (
            <>
              <div onClick={tempoDown.bind(null, 5)} className='button'>
                -5
              </div>
              <div onClick={tempoDown.bind(null, 1)} className='button'>
                -1
              </div>
              <div onClick={tempoUp.bind(null, 1)} className='button'>
                +1
              </div>
              <div onClick={tempoUp.bind(null, 5)} className='button'>
                +5
              </div>
            </>
          ) : (
            <div className={styles.text}>
              <p>
                Click <code>start/stop</code> or <code>{tempo}</code>.
              </p>
              <p>
                Use <code>Arrows</code>, <code>Space</code>, & <code>Tab</code>{' '}
                for control.
              </p>
            </div>
          )}
          <MetronomeLight />
          <div
            id={'metronomeStart'}
            onClick={setPlay.bind(null, !play)}
            onKeyDown={(e) => keyDownHandler(e.code)}
            className={`button ${styles.start}`}
            tabIndex={isMobile ? -1 : 0}
          >
            {play ? 'Stop' : 'Start'}
          </div>
          <MetronomeMute />
        </div>
      </div>
    </>
  );
};

export default Metronome;
