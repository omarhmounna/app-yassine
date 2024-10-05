import React, { useLayoutEffect, useState } from 'react';

function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
        console.log([visualViewport?.width || 0, visualViewport?.height || 0])
      setSize([visualViewport?.width || 0, visualViewport?.height || 0]);
      document.documentElement.style.setProperty('--portview-height',visualViewport?.height+'px');
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => visualViewport?.addEventListener('resize',updateSize) ;
  }, []);
  return size;
}

export default useWindowSize;

