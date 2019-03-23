import {ActionTypes} from './action-types';

export const setFormValues = formValues => ({
  type: ActionTypes.LOGIN_FORM_VALUES_SET, payload: formValues
});
