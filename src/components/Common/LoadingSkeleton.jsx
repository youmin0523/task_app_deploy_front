import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const LoadingSkeleton = () => {
  return (
    // //! [Original Code]
    // <div className="w-1/3 flex flex-col p-4 justify-between">
    // //* [Modified Code] Responsive Grid: Match Item.jsx (Mobile: 1col, Tablet: 2col, Desktop: 3col)
    <div className="w-full md:w-1/2 lg:w-1/3 flex flex-col p-4 justify-between">
      <div>
        <Skeleton width="40%" height="30px" />
      </div>
      <div>
        <Skeleton width="100%" height="30px" />
        <Skeleton width="100%" height="30px" />
        <Skeleton width="100%" height="30px" />
        <Skeleton width="100%" height="30px" />
      </div>
    </div>
  );
};

export default LoadingSkeleton;
