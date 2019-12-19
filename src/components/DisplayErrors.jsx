import React, {useState, useEffect} from 'react';

const DisplayErrors = (props) => {
  const [error, setError] = useState(undefined);

  useEffect(() => {
    setError(props.error)
    setTimeout(() => {
      setError(undefined)
    }, 3500);
  }, [props.error])

  return (
    <div className= {`${!error ? "display-errors display-errors--hidden" : "display-errors"}`} >
      <p>Error:</p>
      <p>{props.error}</p>
    </div>
  );
}

export default DisplayErrors;
