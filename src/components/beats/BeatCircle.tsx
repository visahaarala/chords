import styles from './BeatCircle.module.scss';

import { useContext } from 'react';
import { Context } from '../../context/Context';

const BeatCirle = ({ beatNumber }: { beatNumber: number }) => {
  const ctx = useContext(Context);
  const [beat] = ctx.beatState;

  const style: React.CSSProperties = {
    backgroundColor: beat >= beatNumber ? 'var(--color-black)' : 'var(--color-white)',
  };

  return <div className={styles.beatCircle} style={style} />;
};

export default BeatCirle;