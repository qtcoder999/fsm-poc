const CURVINESS = 50;
const SPACE_IN_BETWEEN = 100;
const WIDTH_OF_CONNECTIONS = 3;

var inputObj = {
  _id: { name: "test1", version: "v1" },
  transitions: [
    {
      state: "start_fsm",
      next: "initiate_call",
      event: "start",
      action: "initiate_call"
    },
    {
      state: "initiate_call",
      next: "record_call",
      event: "Answer",
      action: "record_call"
    },
    {
      state: "record_call",
      next: "add_participant",
      event: "Success",
      action: "add_participant"
    },
    {
      state: "audio_played",
      next: "play_jingle",
      event: "Ok",
      action: "play_jingle"
    },
    {
      state: "add_participant",
      next: "play_jingle",
      event: "Success",
      action: "play_jingle"
    },
    { state: "play_jingle", next: "audio_played", event: "Success" },
    {
      state: "audio_played",
      next: "stop_audio",
      event: "Answer",
      action: "stop_audio"
    },
    { state: "stop_audio", next: "call_patched", event: "Success" },
    {
      state: "call_patched",
      next: "Hangup",
      event: "Disconnected",
      action: "Hangup"
    }
  ],
  stateConfig: { start: "start_fsm", end: ["Hangup", "Completed"] },
  distributed: false,
  _class: "com.airtel.honcho.automata.model.StateMachineDef"
};

const convertToGoJSObject = inputObj => {
  // initialize object
  var outputObj = {
    class: "go.GraphLinksModel",
    nodeKeyProperty: "id",
    nodeDataArray: [],
    linkDataArray: []
  };

  var nodeDataArrayTemp = [];

  // make nodes by traversing the input object transitions
  inputObj.transitions.forEach(element => {
    nodeDataArrayTemp.push(element.state);
    nodeDataArrayTemp.push(element.next);
  });

  // get the unique node array by removing duplicates
  var nodeDataArrayUnique = [...new Set(nodeDataArrayTemp)];

  // make node objects and push it into the output
  nodeDataArrayUnique.forEach((element, index) => {
    outputObj.nodeDataArray.push({
      id: index,
      loc: 0 + " " + index * SPACE_IN_BETWEEN,
      text: element.replace(/_/g, " ")
    });
  });

  // adding connections in node
  inputObj.transitions.forEach((element, index) => {
    outputObj.linkDataArray.push({
      from: nodeDataArrayUnique.indexOf(inputObj.transitions[index].state),
      to: nodeDataArrayUnique.indexOf(inputObj.transitions[index].next),
      text: inputObj.transitions[index].event,
      progress: "true",
      curviness: CURVINESS
    });
  });

  // remove duplicate transitions
  const uniqueArray = outputObj.linkDataArray.filter((thing, index) => {
    const _thing = JSON.stringify(thing);
    return (
      index ===
      outputObj.linkDataArray.findIndex(obj => {
        return JSON.stringify(obj) === _thing;
      })
    );
  });

  outputObj.linkDataArray = uniqueArray;

  return outputObj;
};

const outputObj = convertToGoJSObject(inputObj);

document.getElementById("mySavedModel").value = JSON.stringify(
  outputObj,
  null,
  2
);
