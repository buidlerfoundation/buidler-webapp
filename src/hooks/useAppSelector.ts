import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { AppRootState } from 'store';

const useAppSelector: TypedUseSelectorHook<AppRootState> = useSelector;

export default useAppSelector;
