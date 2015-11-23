export default function actionSwitch({map, cursor, action}) {
  let {type, payload} = action;
  let handler = map[type];
  if (typeof handler === 'function') {
    handler.call(null, cursor, payload);
  }
}
