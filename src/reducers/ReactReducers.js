import actionTypes from '../actions/ActionTypes';

const initialState = {
  reactData: {},
};

const reactReducers = (state = initialState, action) => {
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
      const { id, reactName, userId, isReacted } = payload;
      const currentReact = state.reactData[id] || [];
      const currentIndex = currentReact.findIndex(
        (react) => react.reactName === reactName
      );
      if (currentIndex >= 0) {
        currentReact[currentIndex] = {
          reactName,
          count: currentReact[currentIndex].count + 1,
          skin: 1,
          isReacted,
        };
      } else {
        currentReact.push({
          reactName,
          count: 1,
          skin: 1,
          isReacted,
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
      const { id, reactName, userId } = payload;
      const currentReact = state.reactData[id] || [];
      const currentIndex = currentReact.findIndex(
        (react) => react.reactName === reactName
      );
      if (currentIndex >= 0) {
        currentReact[currentIndex] = {
          reactName,
          count: currentReact[currentIndex].count - 1,
          skin: 1,
          isReacted: false,
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
