// Global Instrument Object handle
var piano;

// Global variables used for recording length
var recordingStart, recordingLength; 

// Global variables used to handle recording
var recordingName = "";
var recordingID;
var recording = false;
var playing = false;
var pause = false;
var intervalStart, intervalEnd;

// Saved recording is the array of notes saved while recording is in process
// Copied recording is the copy made during playback because of how playback is implemented
// (see playNextNote())
var savedRecording = [];
var copiedRecording = [];

var songs = [
    {name: "odeToJoy", data: `[{"key":"G-4","time":743},{"key":"B-4","time":21},{"key":"D-4","time":219},{"key":"G-4","time":241},{"key":"B-4","time":19},{"key":"D-4","time":219},{"key":"A-4","time":242},{"key":"C-5","time":2},{"key":"D-4","time":227},{"key":"B-4","time":241},{"key":"D-5","time":19},{"key":"D-4","time":210},{"key":"B-4","time":240},{"key":"D-5","time":12},{"key":"D-4","time":229},{"key":"A-4","time":250},{"key":"C-5","time":2},{"key":"D-4","time":208},{"key":"G-4","time":279},{"key":"B-4","time":11},{"key":"D-4","time":199},{"key":"A-4","time":291},{"key":"Fs-4","time":2},{"key":"D-4","time":227},{"key":"E-4","time":310},{"key":"G-4","time":10},{"key":"D-4","time":230},{"key":"E-4","time":251},{"key":"G-4","time":12},{"key":"D-4","time":217},{"key":"A-4","time":241},{"key":"Fs-4","time":11},{"key":"D-4","time":228},{"key":"B-4","time":240},{"key":"G-4","time":13},{"key":"D-4","time":218},{"key":"G-4","time":261},{"key":"B-4","time":2},{"key":"D-4","time":416},{"key":"Fs-4","time":622},{"key":"A-4","time":11},{"key":"Fs-4","time":199},{"key":"A-4","time":2},{"key":"D-4","time":567}]`},
    {name: "office", data: `[{"key":"A-4","time":711},{"key":"C-5","time":8},{"key":"F-4","time":201},{"key":"C-5","time":168},{"key":"A-4","time":7},{"key":"A-4","time":705},{"key":"C-5","time":7},{"key":"F-4","time":201},{"key":"A-4","time":192},{"key":"C-5","time":7},{"key":"E-4","time":201},{"key":"A-4","time":216},{"key":"C-5","time":7},{"key":"C-5","time":769},{"key":"A-4","time":0},{"key":"E-4","time":176},{"key":"D-5","time":272},{"key":"A-4","time":7},{"key":"D-4","time":193},{"key":"D-5","time":232},{"key":"A-4","time":7},{"key":"D-5","time":713},{"key":"A-4","time":15},{"key":"D-4","time":185},{"key":"As-4","time":215},{"key":"G-4","time":8},{"key":"G-4","time":400},{"key":"As-4","time":8},{"key":"G-4","time":376},{"key":"As-4","time":8},{"key":"A-4","time":200},{"key":"G-4","time":176},{"key":"A-4","time":208},{"key":"F-4","time":216}]`},
    {name: "test1", data: `[{"key":"A-4","time":711}]`},
    {name: "test2", data: `[{"key":"A-4","time":711}]`},
    {name: "test3", data: `[{"key":"A-4","time":711}]`},
    {name: "test4", data: `[{"key":"A-4","time":711}]`},
    {name: "test5", data: `[{"key":"A-4","time":711}]`},
    {name: "test6", data: `[{"key":"A-4","time":711}]`},
]

var savedRecordings = {

};

// Maps a keyboard key value to the corresponding piano note/octave
var pianoKeys = {
    "a": "C-4",
    "s": "D-4",
    "d": "E-4",
    "f": "F-4",
    "g": "G-4",
    "h": "A-4",
    "j": "B-4",
    "k": "C-5",
    "l": "D-5",
    ";": "E-5",
    "w": "Cs-4",
    "e": "Ds-4",
    "t": "Fs-4",
    "y": "Gs-4",
    "u": "As-4",
    "o": "Cs-5",
    "p": "Ds-5"
} // end pianoKeys()

// Converts the ids for sharp keys to the note played on the piano;
// necessary because you can't use a pound sign (#) in ids for elements because
// it messes with jQuery selectors
function sharpSwitch(key) {
    switch (key) {
        case "Cs":
            return "C#";
        case "Ds":
            return "D#";
        case "Fs":
            return "F#";
        case "Gs":
            return "G#";
        case "As":
            return "A#";
        default:
            return key;
    }
}// end sharpSwitch()

// On Window Load
window.onload = () => {
    $('.key').mousedown((target) => {
        var audio = $(target.target).attr('id');
        play_audio(audio);
    })
    
    // Handler for playing notes with the keyboard; only plays for valid mapped keys
    document.onkeydown = (event) => {
        if (event.target.id == $("#saved-name").attr('id')) {
            return;
        }
        let audio = pianoKeys[event.key.toLowerCase()];
        if (audio){
            play_audio(audio);
        }
    };

    piano = Synth.createInstrument('piano');
    Synth.setVolume(0.5);

    for (const song of songs) {
        addRecordingToList(song.name, song.data);
    }

    $(".list-container").scrollTop($(".list-container")[0].scrollHeight);
} // end window.onload

function setVolume(newLevel) {
    // Handler for the Volume slider, changes the volume level according to the current value
    Synth.setVolume(newLevel/100);
    let label = "";
    if (newLevel === "0") {
        label = "Muted!";
    } else {
        label = `${newLevel}%`;
    }
    $("#volume-value").text(label);
} // end setVolume

function play_audio(id) {
    // Dynamically select audio files based on which area on image map/keyboard
    // was clicked. Id's on image map correspond to the file names
    if (recording) {
        intervalEnd = new Date();
        var timeDiff = intervalEnd - intervalStart; //in ms
        savedRecording.push({"key": id, "time": timeDiff})
        intervalStart = intervalEnd;
    }

    let note = id.split("-");
    piano.play(sharpSwitch(note[0]), note[1], 1.5);

    $(`#${id}`).addClass('pressed');
    setTimeout(() => {
        $(`#${id}`).removeClass('pressed');
    }, 100);
} // end play_audio()

// Begins recording played notes; notes are actually recorded in the play_audio function
// Displays the 'Recording' tag at the top right of the piano 
function startRecording() {
    if (!playing) {
        if (recordingName === "") {
            setInfo(`Enter a Recording Name Below!`, "black")
            return;
        } else if (Object.keys(savedRecordings).includes(recordingName)) {
            setInfo(`"${recordingName}" already exists, enter different name`, "black");
            return;
        }
        setInfo("Recording", "red");
        // $("#saved").css('visibility', 'hidden');
        // $("#saved").text(`Loaded Recording: `);
        // $("#recording").css({'visibility': 'visible'})
        savedRecording = [];
        intervalStart = new Date();
        recordingStart = intervalStart;
        recording = true;
    }
} // end startRecording()

// Stops 
function stopRecording() {
    if (!playing && recording) {
        recording = false;

        // If the recording is empty, don't signify that there's a saved recording
        if (!savedRecording.length) {
            setInfo("Empty Recording", "black")
        } else {
            setInfo(`Loaded Recording: ${recordingName}`, "black")
            addRecordingToList(recordingName, JSON.stringify(savedRecording));
            $(".list-container").scrollTop($(".list-container")[0].scrollHeight);
        }
    } else if (playing) {
        pause = true;
    }
} // end stopRecording()

// Plays back the recorded audio using 
function playRecording() {
    // Perform a deep copy on the saved recording because I shift() the data
    if (!playing) {
        copiedRecording = JSON.parse(JSON.stringify(savedRecording));    
        pause = false;
        if (!recording) {
            if (copiedRecording.length) {
                playing = true;
                setInfo("Playing", "green");
                playNextNote(copiedRecording.shift());
            } 
        }
    }
} // end playRecording()

// Plays a note after a certain amount of time, then recursively calls itself.
// This functionally allows us to play back notes with the exact timing they
// were recorded.
function playNextNote(note) {
    setTimeout(() => {
        if (pause) {
            // $("#playing").css('visibility', 'hidden');
            // $("#saved").css('visibility', 'visible');
            playing = false;
            return;
        }

        play_audio(note.key);

        if (copiedRecording.length) {
            playNextNote(copiedRecording.shift())
        } else {
            setTimeout(() => {
                // $("#playing").css('visibility', 'hidden');
                // $("#saved").css('visibility', 'visible');
                setInfo(`Loaded Recording: ${recordingName}`, "black")
                playing = false;
            }, 300);
            
        }
    }, note.time);
} // end playNextNote()

function updateRecordingName(name) {
    recordingName = name;
} 

// Adds the current recording to the list of saved recordings
function addRecordingToList(name, data) {
    if (!Object.keys(savedRecordings).includes(name)) {
        savedRecordings[name] = data;
        console.log(savedRecordings[name]);
        $('#recording-list li').remove();

        $.each(Object.keys(savedRecordings), function(index, value) {
            $('#recording-list').append(`<li id="r-${index}" class="record-name">${value}</li>`)
        });

        updateLoadedRecording(name, `r-${Object.keys(savedRecordings).length-1}`);

        $('#recording-list li').on('click', (e) => {
            updateLoadedRecording(e.target.innerText, e.target.id);
        });

        $('#saved-name').val("");
    } 
}

// Changes the current recording to the loaded recording corresponding to 'name'
function updateLoadedRecording(name, id) {
    if (savedRecordings[name]) {
        // remove outline from previously selected recording
        $(`#${recordingID}`).css({
                                'background-color': 'white',
                                'color': 'black',
                                });

        // Add outline to selected recording and change the current recording
        recordingID = id;
        $(`#${recordingID}`).css({
                                'background-color': 'rgb(116, 116, 201)',
                                'color': 'white'
                                });
        savedRecording = JSON.parse(savedRecordings[name]);
        recordingName = name;
        
        setInfo(`Loaded Recording: ${name}`, "black");
    }
}

function setInfo(label, color) {
    $("#info").css({
        "color": color,
    });

    $("#info").text(label);
}