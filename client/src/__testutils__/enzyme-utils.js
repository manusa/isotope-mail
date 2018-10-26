import {shallowToJson} from 'enzyme-to-json';

/**
 * Serialized the component using enzyme-to-json removing unnecessary and ugly store properties
 * @param component
 * @returns {*}
 */
export const shallowComponentWithStoreToJson = component =>
  shallowToJson(component, {map: json => {
    const props = {...json.props};
    delete props.dispatch;
    delete props.store;
    delete props.storeSubscription;
    return ({...json, props: props});
  }});
