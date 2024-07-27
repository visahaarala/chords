const Plus = ({ height }: { height?: number }) => {
  const xmin = 0;
  const ymin = 0;

  const svgWidth = 40;
  const svgHeight = 40;

  const divWidth = height ? `${height * (svgWidth / svgHeight)}rem` : undefined;

  return (
    <svg
      style={{ width: divWidth }}
      xmlns='http://www.w3.org/2000/svg'
      viewBox={`${xmin} ${ymin} ${svgWidth} ${svgHeight}`}
    >
      <path
        d='M0 20H40M20 0V40'
        stroke='currentColor'
        strokeWidth={8}
        fill='none'
        strokeLinecap='square'
      />
    </svg>
  );
};

export default Plus;
