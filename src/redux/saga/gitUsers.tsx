import { all, call, put, select, takeLatest } from 'redux-saga/effects';

import { ADD_MORE_USERS, USER_DETAILS } from '../actions/constants';
import { fetchingUserDetails } from '../gitUserDetails';
import {
  fetchGitUsersListStart,
  fetchGitUsersListSuccess,
  fetchPaginatedUsersList,
} from '../gitUsersList';
import {
  fetchData,
  fetchPaginatedData,
  fetchUserDetails,
  fetchUserHistory,
} from '../services/userListApi';
function* gitUsersWatcher() {
  yield takeLatest(
    [fetchGitUsersListStart.type, ADD_MORE_USERS, USER_DETAILS],
    gitUsersWorker,
  );
}
interface checkType{
  payload: any;
  type: string;
}
function* gitUsersWorker({type,payload}: checkType):any {
  try {
    switch (type) {
      case fetchGitUsersListStart.type: {
        const data = yield call(fetchData);
        yield put(fetchGitUsersListSuccess({ userData: data }));
        break;
      }

      case ADD_MORE_USERS: {
        const { userList } = yield select(state => state.userList);
        const [lastItem] = userList.slice(-1);
        const { id } = lastItem;
        const clonedUserList = JSON.parse(JSON.stringify(userList));
        const data = yield call(fetchPaginatedData, { id });
        yield put(fetchPaginatedUsersList({ userData: [...clonedUserList, ...data] }));
        break;
      }

      case USER_DETAILS: {
        const { username } = payload;
        const [userdetails, userhistory] = yield all([
          call(fetchUserDetails, { username }),
          call(fetchUserHistory, { username }),
        ]);
        const newUserHistory = userhistory.filter(
          (user: any) => user.type === 'PullRequestEvent',
        );
        yield put(
          fetchingUserDetails({
            userData: userdetails,
            userHistory: newUserHistory,
          }),
        );
      }
      default:
        break;
    }
  } catch (err) {
    console.error(`Error occuring while calling an action ${type}`, err);
  }
}

export default gitUsersWatcher;
