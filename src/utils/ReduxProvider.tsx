'use client';

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider } from 'react-redux';
import store from '@/store/';

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}><DndProvider backend={HTML5Backend}>{children}</DndProvider></Provider>;
}