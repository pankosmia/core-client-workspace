import {createContext} from 'react';

const OBSContext = createContext({obs: [1,1], setObs: ()=> {}});

export default OBSContext;