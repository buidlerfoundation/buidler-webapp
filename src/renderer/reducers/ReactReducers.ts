import { AnyAction, Reducer } from 'redux';
import { ReactReducerData } from 'renderer/models';
import actionTypes from '../actions/ActionTypes';

interface ReactReducerState {
  reactData: { [key: string]: Array<ReactReducerData> };
}

const initialState: ReactReducerState = {
  reactData: {},
};

const reactReducers: Reducer<ReactReducerState, AnyAction> = (
  state = initialState,
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.TASK_SUCCESS: {
      const { tasks } = payload;
      const currentReact = {};
      tasks.map((task) => {
        if (task.reaction_data.length > 0) {
          currentReact[task.task_id] = task.reaction_data.map((react) => ({
            reactName: react.emoji_id,
            count: parseInt(react.reaction_count),
            skin: react.skin,
            isReacted: !!task.user_reaction.find(
              (uReact) => uReact.emoji_id === react.emoji_id
            ),
          }));
        }
        return task;
      });
      return {
        reactData: {
          ...state.reactData,
          ...currentReact,
        },
      };
    }
    case actionTypes.MESSAGE_SUCCESS: {
      const { data } = payload;
      const currentReact = {};
      data.map((dt) => {
        if (dt.reaction_data.length > 0) {
          currentReact[dt.message_id] = dt.reaction_data.map((react) => ({
            reactName: react.emoji_id,
            count: parseInt(react.reaction_count),
            skin: react.skin,
            isReacted: !!dt.user_reaction.find(
              (uReact) => uReact.emoji_id === react.emoji_id
            ),
          }));
        }
        return dt;
      });
      return {
        reactData: {
          ...state.reactData,
          ...currentReact,
        },
      };
    }
    case actionTypes.ADD_REACT: {
      const { id, reactName, mine } = payload;
      const currentReact = state.reactData[id] || [];
      const currentIndex = currentReact.findIndex(
        (react) => react.reactName === reactName
      );
      if (currentIndex >= 0) {
        currentReact[currentIndex] = {
          reactName,
          count: currentReact[currentIndex].count + 1,
          skin: 1,
          isReacted: currentReact[currentIndex].isReacted || mine,
        };
      } else {
        currentReact.push({
          reactName,
          count: 1,
          skin: 1,
          isReacted: mine,
        });
      }
      return {
        reactData: {
          ...state.reactData,
          [id]: [...currentReact],
        },
      };
    }
    case actionTypes.REMOVE_REACT: {
      const { id, reactName, mine } = payload;
      const currentReact = state.reactData[id] || [];
      const currentIndex = currentReact.findIndex(
        (react) => react.reactName === reactName
      );
      if (currentIndex >= 0) {
        currentReact[currentIndex] = {
          reactName,
          count: currentReact[currentIndex].count - 1,
          skin: 1,
          isReacted: mine ? false : currentReact[currentIndex].isReacted,
        };
      }
      return {
        reactData: {
          ...state.reactData,
          [id]: [...currentReact].filter((react) => react.count > 0),
        },
      };
    }
    default:
      return state;
  }
};

export default reactReducers;
