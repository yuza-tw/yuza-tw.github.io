// サンプル進行
const chordProgression = [
    ['F|maj7', 'E|m7', 'D|m7', 'G|13'],
    ['C|maj7', 'A|m7', 'D|m7/G', 'G|7b9'],
    ['E|m7b5', 'A|7', 'D|m9', 'G|m7/C'],
    ['F|maj7', 'B|m7b5', 'E|7#9', 'A|m9'],
    ['F|maj7#11', 'E|m9', 'D|m11', 'G|13b9'],
    ['C|maj9', 'D|m11', 'F|9sus4', 'G|7#5'],
    ['F|m7', 'Bb|13', 'Eb|maj7', 'Ab|maj7'],
    ['D|m7b5', 'G|7b9', 'C|maj9', 'C|maj']
];

// コードデータベース
const chordTypeDefinitions = [
    { name: 'maj', type: 'major', intervals: [0, 4, 7] },
    { name: 'maj7', type: 'major', intervals: [0, 4, 7, 11] },
    { name: 'maj9', type: 'major', intervals: [0, 4, 7, 11, 14] },
    { name: 'maj11', type: 'major', intervals: [0, 4, 7, 11, 14, 17] },
    { name: 'maj13', type: 'major', intervals: [0, 4, 7, 11, 14, 21] },
    { name: 'maj7#11', type: 'major', intervals: [0, 4, 7, 11, 18] },
    { name: 'maj7#5', type: 'major', intervals: [0, 4, 8, 11] },
    { name: '6', type: 'major', intervals: [0, 4, 7, 9] },
    { name: '69', type: 'major', intervals: [0, 4, 7, 9, 14] },
    { name: 'add9', type: 'major', intervals: [0, 4, 7, 14] },
    
    { name: 'm', type: 'minor', intervals: [0, 3, 7] },
    { name: 'm6', type: 'minor', intervals: [0, 3, 7, 9] },
    { name: 'm7', type: 'minor', intervals: [0, 3, 7, 10] },
    { name: 'm9', type: 'minor', intervals: [0, 3, 7, 10, 14] },
    { name: 'm11', type: 'minor', intervals: [0, 3, 7, 10, 14, 17] },
    { name: 'm13', type: 'minor', intervals: [0, 3, 7, 10, 14, 21] },
    { name: 'mM7', type: 'minor', intervals: [0, 3, 7, 11] },
    { name: 'mM9', type: 'minor', intervals: [0, 3, 7, 11, 14] },
    { name: 'm7b5', type: 'minor', intervals: [0, 3, 6, 10] },
    { name: 'm9b5', type: 'minor', intervals: [0, 3, 6, 10, 14] },
    
    { name: '7', type: 'dominant', intervals: [0, 4, 7, 10] },
    { name: '9', type: 'dominant', intervals: [0, 4, 7, 10, 14] },
    { name: '11', type: 'dominant', intervals: [0, 4, 7, 10, 14, 17] },
    { name: '13', type: 'dominant', intervals: [0, 4, 7, 10, 14, 21] },
    { name: '13b9', type: 'dominant', intervals: [0, 4, 7, 10, 13, 21] },
    { name: '7b5', type: 'dominant', intervals: [0, 4, 6, 10] },
    { name: '7#5', type: 'dominant', intervals: [0, 4, 8, 10] },
    { name: '7b9', type: 'dominant', intervals: [0, 4, 7, 10, 13] },
    { name: '7#9', type: 'dominant', intervals: [0, 4, 7, 10, 15] },
    { name: '7b5b9', type: 'dominant', intervals: [0, 4, 6, 10, 13] },
    { name: '7#5b9', type: 'dominant', intervals: [0, 4, 8, 10, 13] },
    { name: '7#11', type: 'dominant', intervals: [0, 4, 7, 10, 18] },
    { name: '7alt', type: 'dominant', intervals: [0, 4, 8, 10, 13, 15] },
    
    { name: 'dim', type: 'diminished', intervals: [0, 3, 6] },
    { name: 'dim7', type: 'diminished', intervals: [0, 3, 6, 9] },
    { name: 'm7b5', type: 'diminished', intervals: [0, 3, 6, 10] },
    
    { name: 'aug', type: 'augmented', intervals: [0, 4, 8] },
    { name: 'aug7', type: 'augmented', intervals: [0, 4, 8, 10] },
    { name: 'aug9', type: 'augmented', intervals: [0, 4, 8, 10, 14] },
    
    { name: 'sus2', type: 'suspended', intervals: [0, 2, 7] },
    { name: 'sus4', type: 'suspended', intervals: [0, 5, 7] },
    { name: '7sus4', type: 'suspended', intervals: [0, 5, 7, 10] },
    { name: '9sus4', type: 'suspended', intervals: [0, 5, 7, 10, 14] },
    { name: '13sus4', type: 'suspended', intervals: [0, 5, 7, 10, 14, 21] },
    
    { name: '5', type: 'other', intervals: [0, 7] },
    { name: 'quartal', type: 'other', intervals: [0, 5, 10, 15] },
    { name: 'whole', type: 'other', intervals: [0, 2, 4, 6, 8, 10] }
];

// 連想配列にする
const chordIntervals = {}, chordTypes = {};
chordTypeDefinitions.forEach(def => {
    chordIntervals[def.name] = def.intervals;
    chordTypes[def.name] = def.type;
});

const noteToMidi = {
    'C': 60, 'Db': 61,
    'D': 62, 'Eb': 63,
    'E': 64,
    'F': 65, 'Gb': 66,
    'G': 67, 'Ab': 68,
    'A': 69, 'Bb': 70,
    'B': 71
};

// シンセサイザーの定義
const synthTypes = {
    'piano': new Tone.Sampler({
        urls: { "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", "A4": "A4.mp3" },
    }).toDestination(),
    'synth': new Tone.PolySynth(Tone.Synth, {
        envelope: {
            attack: 0.01,
            decay: 6,
            sustain: 0,
            release: 0.2
        }
    }).toDestination(),
    'am': new Tone.PolySynth(Tone.AMSynth, {
        envelope: {
            attack: 0.01,
            decay: 6,
            sustain: 0,
            release: 0.2
        }
    }).toDestination(),
    'fm': new Tone.PolySynth(Tone.FMSynth, {
        envelope: {
            attack: 0.01,
            decay: 6,
            sustain: 0,
            release: 0.2
        }
    }).toDestination()
};

let currentSynth = 'piano';
let isPlaying = false;
let currentChordIndex = 0;
let dragSrcElement = null;
let dragSrcRow = null;
let dragSrcCol = null;
let codeHistory = [];

window.onload = () => {
    const controlsContainer = document.getElementById('controls');
    controlsContainer.appendChild(createControlPanel());
    
    // グリッドの初期表示
    const grid = document.getElementById('chordGrid');
    chordProgression.forEach((row, rowIndex) => {
        row.forEach((chord, colIndex) => {
            const chordContainer = createChordContainer(chord, rowIndex, colIndex);
            grid.appendChild(chordContainer);
        });
    });
    
    Object.values(synthTypes).forEach(synth => {
        synth.volume.value = -12;
    });
    
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            undoLastChange();
        }
    });
    
    updateSourceCode();
};

function updateSourceCode() {
    const sourceCode = document.getElementById('source-code');
    const newCode = chordProgression.map(row => '["' + row.join('", "') + '"],').join('\n').replace(/,$/, '');
    if (newCode != sourceCode.textContent) {
        codeHistory.push(sourceCode.textContent);
    }
    sourceCode.textContent = newCode;
}

function undoLastChange() {
    if (codeHistory.length > 0) {
        const previousCode = codeHistory.pop();
        if (previousCode != "") {
            const sourceCode = document.getElementById('source-code');
            sourceCode.value = previousCode;
            updateFromSourceCode();
        }
    }
}

// テキストエリアからコード進行を更新する関数
function updateFromSourceCode() {
    const sourceCode = document.getElementById('source-code');
    try {
        // テキストから配列に変換する処理
        const text = sourceCode.value.trim().replace(/,$/, '');
        const formattedText = text
            .replace(/\[\s*"/g, '["')
            .replace(/"\s*,\s*"/g, '","')
            .replace(/"\s*\]/g, '"]')
            .replace(/\],\s*\[/g, '],[');
            
        // evalを使用せず、安全にJSONとして解析できる形式に変換
        const jsonText = '[' + formattedText.replace(/\]\s*,\s*\[/g, '],[') + ']';
        const parsedProgression = JSON.parse(jsonText);
        
        // 有効性チェック
        if (!Array.isArray(parsedProgression)) throw new Error('Invalid format');
        
        parsedProgression.forEach(row => {
            if (!Array.isArray(row)) throw new Error('Invalid row format');
            row.forEach(chord => {
                if (typeof chord !== 'string') throw new Error('Invalid chord format');
                // コードの形式をチェック
                const { root, quality } = parseChord(chord);
                if (!root || !noteToMidi[root]) throw new Error(`Invalid root note: ${root}`);
                if (!chordIntervals[quality]) throw new Error(`Invalid chord quality: ${quality}`);
            });
        });
        
        chordProgression.length = 0;
        parsedProgression.forEach(row => { chordProgression.push([...row]); });
        
        updateChordGrid();
    } catch (e) {
        console.error(e);
        showMessage('構文エラー: ' + e.message, 'error');
    }
}

function showMessage(text, type) {
    const existingMsg = document.getElementById('message');
    if (existingMsg) existingMsg.remove();
    
    const msg = document.createElement('div');
    msg.id = 'message';
    msg.textContent = text;
    msg.className = type;
    msg.style.position = 'fixed';
    msg.style.top = '20px';
    msg.style.right = '20px';
    msg.style.padding = '10px 15px';
    msg.style.borderRadius = '5px';
    msg.style.zIndex = '1000';
    
    if (type === 'error') {
        msg.style.backgroundColor = '#ffcccc';
        msg.style.color = '#cc0000';
        msg.style.border = '1px solid #cc0000';
    } else {
        msg.style.backgroundColor = '#ccffcc';
        msg.style.color = '#006600';
        msg.style.border = '1px solid #006600';
    }
    
    document.body.appendChild(msg);
    
    setTimeout(() => {
        msg.style.opacity = '0';
        msg.style.transition = 'opacity 0.5s';
        setTimeout(() => msg.remove(), 500);
    }, 3000);
}

function parseChord(chordName) {
    let [main, bassNote] = chordName.split('/');
    let [root, quality] = main.split('|');
    return { root, quality: quality || 'maj', bassNote };
}

function chordToNotes(chordName) {
    const { root, quality, bassNote } = parseChord(chordName);
    const rootMidi = noteToMidi[root];
    
    // 構成音計算　ボイシングは片手で抑えられる範囲に
    let notes = chordIntervals[quality].map(interval => {
        let midiNote = rootMidi + interval;
        while (midiNote < 60) midiNote += 12;
        while (midiNote > 76) midiNote -= 12;
        return Tone.Frequency(midiNote, "midi").toNote();
    });
    
    // ベース音追加　指定がなければルートを使う
    if (bassNote) {
        notes.unshift(Tone.Frequency(noteToMidi[bassNote] - 24, "midi").toNote());
    } else {
        notes.unshift(Tone.Frequency(noteToMidi[root] - 24, "midi").toNote());

    }
    
    notes.sort((a, b) => Tone.Frequency(a).toMidi() - Tone.Frequency(b).toMidi());    
    return notes;
}

function playChord(chord) {
    synthTypes[currentSynth].releaseAll();
    synthTypes[currentSynth].triggerAttack(chordToNotes(chord));
}

function startProgression() {
    if (isPlaying) return;
    isPlaying = true;
    currentChordIndex = 0;

    Tone.Transport.scheduleRepeat((time) => {
        const row = currentChordIndex >> 2;
        const col = currentChordIndex % 4;
        playChord(chordProgression[row][col]);
        highlightChord(currentChordIndex);
        currentChordIndex = (currentChordIndex + 1) % (chordProgression.length * 4);
    }, '1n');

    Tone.Transport.start();
}

function stopProgression() {
    isPlaying = false;
    Tone.Transport.stop();
    Tone.Transport.cancel();
    synthTypes[currentSynth].releaseAll();
    removeAllHighlights();
}

function highlightChord(index) {
    removeAllHighlights();
    const chords = document.getElementsByClassName('chord');
    chords[index].classList.add('playing');
}

function removeAllHighlights() {
    const chords = document.getElementsByClassName('chord');
    Array.from(chords).forEach(chord => {
        chord.classList.remove('playing');
    });
}

function createSynthSelector() {
    const selector = document.createElement('select');
    selector.id = 'synthSelector';
    Object.keys(synthTypes).forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        selector.appendChild(option);
    });
    selector.onchange = (e) => {
        Object.values(synthTypes).forEach(synth => {
            synth.releaseAll();
        });
        currentSynth = e.target.value;
    };
    return selector;
}

function createVolumeControl() {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '10px';
    
    const label = document.createElement('label');
    label.textContent = '音量';
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = -40;
    slider.max = 0;
    slider.value = -12;
    slider.step = 1;
    slider.style.width = '120px';
    
    slider.oninput = (e) => {
        Object.values(synthTypes).forEach(synth => {
            synth.volume.value = parseFloat(e.target.value);
        });
    };
    
    container.appendChild(label);
    container.appendChild(slider);
    return container;
}

// コントロールパネルの作成
function createControlPanel() {
    const basePanel = document.createElement('div');
    basePanel.style.margin = '20px';
    basePanel.style.display = 'flex';
    basePanel.style.flexDirection = 'row';
    basePanel.style.alignItems = 'bottom';
    basePanel.style.gap = '15px';
    
    const panel = document.createElement('div');
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.gap = '15px';
    
    // 音色選択
    const synthContainer = document.createElement('div');
    synthContainer.style.display = 'flex';
    synthContainer.style.alignItems = 'center';
    synthContainer.style.gap = '10px';
    
    const synthLabel = document.createElement('label');
    synthLabel.textContent = '音色';
    synthContainer.appendChild(synthLabel);
    synthContainer.appendChild(createSynthSelector());
    panel.appendChild(synthContainer);
    
    // 音量コントロール
    const volumeContainer = document.createElement('div');
    volumeContainer.style.display = 'flex';
    volumeContainer.style.alignItems = 'center';
    volumeContainer.style.gap = '10px';
    volumeContainer.appendChild(createVolumeControl());
    panel.appendChild(volumeContainer);
    
    // テンポコントロール
    const tempoContainer = document.createElement('div');
    tempoContainer.style.display = 'flex';
    tempoContainer.style.alignItems = 'center';
    tempoContainer.style.gap = '10px';
    
    const tempoLabel = document.createElement('label');
    tempoLabel.textContent = 'テンポ';
    
    const tempoInput = document.createElement('input');
    tempoInput.type = 'number';
    tempoInput.min = '40';
    tempoInput.max = '200';
    tempoInput.value = '120';
    tempoInput.style.width = '120px';
    tempoInput.style.height = '20px';
    tempoInput.onchange = (e) => {
        Tone.Transport.bpm.value = parseFloat(e.target.value);
    };
    
    tempoContainer.appendChild(tempoLabel);
    tempoContainer.appendChild(tempoInput);
    panel.appendChild(tempoContainer);
    
    // メディアコントロールボタン
    const mediaControls = document.createElement('div');
    mediaControls.style.display = 'flex';
    mediaControls.style.gap = '15px';
    
    const playButton = document.createElement('button');
    playButton.textContent = '再生';
    playButton.onclick = startProgression;
    mediaControls.appendChild(playButton);
    
    const stopButton = document.createElement('button');
    stopButton.textContent = '停止';
    stopButton.onclick = stopProgression;
    mediaControls.appendChild(stopButton);
    
    const exportButton = document.createElement('button');
    exportButton.textContent = 'MIDI出力';
    exportButton.onclick = exportToMidi;
    mediaControls.appendChild(exportButton);
    
    panel.appendChild(mediaControls);
    basePanel.appendChild(panel);

    const sourceCodeContainer = document.createElement('div');
    sourceCodeContainer.style.display = 'flex';
    sourceCodeContainer.style.flexDirection = 'column';
    sourceCodeContainer.style.gap = '10px';
    
    const sourceCode = document.createElement('textarea');
    sourceCode.style.fontSize = '16px';
    sourceCode.style.width = '400px';
    sourceCode.style.height = '150px';
    sourceCode.id = 'source-code';
    sourceCodeContainer.appendChild(sourceCode);
    
    const updateButton = document.createElement('button');
    updateButton.textContent = 'ロード';
    updateButton.onclick = updateFromSourceCode;
    sourceCodeContainer.appendChild(updateButton);
    
    basePanel.appendChild(sourceCodeContainer);

    return basePanel;
}

function exportToMidi() {
    const file = new Midi();
    const track = file.addTrack();
    
    let time = 0;
    chordProgression.forEach(row => {
        row.forEach(chord => {
            const notes = chordToNotes(chord);
            notes.forEach(note => {
                const midiNote = Tone.Frequency(note).toMidi();
                track.addNote({
                    midi: midiNote,
                    time: time,
                    duration: 2
                });
            });
            time += 2;
        });
    });

    const blob = new Blob([file.toArray()], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.mid';
    a.click();
    URL.revokeObjectURL(url);
}

function getChordType(quality) {
    if (quality in chordTypes) {
        return chordTypes[quality];
    }
    return 'other';
}

function createChordSelector(rowIndex, colIndex) {
    const container = document.createElement('div');
    container.className = 'chord-selector';

    const currentChord = chordProgression[rowIndex][colIndex];
    const { root, quality, bassNote } = parseChord(currentChord);

    const handleWheel = (select, e) => {
        e.preventDefault();
        const options = select.options;
        const currentIndex = select.selectedIndex;
        const direction = e.deltaY > 0 ? 1 : -1;
        const newIndex = (currentIndex + direction + options.length) % options.length;
        select.selectedIndex = newIndex;
        select.dispatchEvent(new Event('change'));
    };

    const rootSelect = document.createElement('select');
    Object.keys(noteToMidi).forEach(note => {
        const option = document.createElement('option');
        option.value = note;
        option.textContent = note;
        if (note === root) {
            option.selected = true;
        }
        rootSelect.appendChild(option);
    });
    rootSelect.onwheel = (e) => handleWheel(rootSelect, e);

    const qualitySelect = document.createElement('select');
    chordTypeDefinitions.forEach(def => {
        const option = document.createElement('option');
        option.value = def.name;
        option.textContent = def.name;
        if (def.name === quality) {
            option.selected = true;
        }
        qualitySelect.appendChild(option);
    });
    qualitySelect.onwheel = (e) => handleWheel(qualitySelect, e);

    const bassSelect = document.createElement('select');
    const noBassOption = document.createElement('option');
    noBassOption.value = '';
    noBassOption.textContent = '-';
    if (!bassNote) {
        noBassOption.selected = true;
    }
    bassSelect.appendChild(noBassOption);
    Object.keys(noteToMidi).forEach(note => {
        const option = document.createElement('option');
        option.value = note;
        option.textContent = note;
        if (note === bassNote) {
            option.selected = true;
        }
        bassSelect.appendChild(option);
    });
    bassSelect.onwheel = (e) => handleWheel(bassSelect, e);

    const randomButton = document.createElement('button');
    randomButton.textContent = '⚅';
    randomButton.onclick = (e) => {
        e.stopPropagation();
        randomizeChord(rowIndex, colIndex);
    };

    const updateChord = () => {
        let newChord = `${rootSelect.value}|${qualitySelect.value}`;
        if (bassSelect.value) {
            newChord += `/${bassSelect.value}`;
        }
        chordProgression[rowIndex][colIndex] = newChord;
        updateChordDisplay(rowIndex, colIndex, newChord);
    };

    rootSelect.onchange = updateChord;
    qualitySelect.onchange = updateChord;
    bassSelect.onchange = updateChord;

    container.appendChild(rootSelect);
    container.appendChild(qualitySelect);
    container.appendChild(bassSelect);
    container.appendChild(randomButton);

    return container;
}

function findClosestChordQuality(intervals) {
    let bestMatch = { quality: '?', distance: Infinity };
    
    for (const [quality, template] of Object.entries(chordIntervals)) {
        const normalizedTemplate = template.map(i => i % 12).sort((a, b) => a - b);
        const distance = intervals.reduce((sum, interval) => {
            const closest = normalizedTemplate.reduce((min, t) => 
                Math.min(min, Math.min(
                    Math.abs(interval - t),
                    Math.abs(interval - (t + 12))
                ))
            , 12);
            return sum + closest;
        }, 0);
        
        if (distance < bestMatch.distance) {
            bestMatch = { quality, distance };
        }
    }
    
    return bestMatch.quality;
}

function updateChordDisplay(rowIndex, colIndex, newChord) {
    const index = rowIndex * 4 + colIndex;
    const chordContainers = document.getElementsByClassName('chord-container');
    const chordContainer = chordContainers[index];
    const chordElement = chordContainer.querySelector('.chord');
    
    const oldPianoKeys = chordContainer.querySelector('.piano-keys');
    if (oldPianoKeys) { oldPianoKeys.remove(); }
    
    const notes = getChordNotes(newChord);
    createPianoKeys(chordContainer, notes, chordProgression[rowIndex][colIndex].split('|')[0]);
    
    const { root, quality } = parseChord(newChord);
    chordElement.dataset.type = getChordType(quality);
    chordElement.textContent = newChord.replace('|', '');
    chordElement.onclick = () => { playChord(newChord); highlightChord(index); };

    updateSourceCode();
    
    playChord(newChord);
}

function randomizeChord(rowIndex, colIndex) {
    const chord = chordProgression[rowIndex][colIndex];
    const { root } = parseChord(chord);
    
    const randomChordType = chordTypeDefinitions[Math.floor(Math.random() * chordTypeDefinitions.length)];
    let newChord = `${root}|${randomChordType.name}`;
    
    const hasBass = Math.random() < 0.2;
    if (hasBass) {
        const notes = Object.keys(noteToMidi);
        const randomBass = notes[Math.floor(Math.random() * notes.length)];
        newChord += `/${randomBass}`;
    }
    
    chordProgression[rowIndex][colIndex] = newChord;
    updateChordDisplay(rowIndex, colIndex, newChord);
    updateSourceCode();
}

function createPianoKeys(container, notes, rootNote) {
    const pianoKeys = document.createElement('div');
    pianoKeys.className = 'piano-keys';
    
    const normalizedNotes = notes.map(note => note.replace(/[1-9]/, ''));
    const normalizedRoot = rootNote.replace(/[1-9]/, '');
    
    const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const blackKeys = ['C#', 'D#', 'F#', 'G#', 'A#'];
    const blackKeysFlat = ['Db', 'Eb', '?', 'Gb', 'Ab', 'Bb', '?'];
    
    whiteKeys.forEach((note, index) => {
        const key = document.createElement('div');
        key.className = 'piano-key';
        key.dataset.note = note;
        if (note === normalizedRoot) {
            key.classList.add('root');
        } else if (normalizedNotes.includes(note)) {
            key.classList.add('active');
        }
        
        if (note !== normalizedRoot) {
            key.onclick = () => toggleNote(container, note);
        }
        
        pianoKeys.appendChild(key);
        
        if (blackKeys.includes(note + '#')) {
            const blackKey = document.createElement('div');
            blackKey.className = 'piano-key black';
            blackKey.dataset.note = note + '#';
            if (blackKeysFlat[index] === normalizedRoot) {
                blackKey.classList.add('root');
            } else if (normalizedNotes.includes(note + '#')) {
                blackKey.classList.add('active');
            }
            
            if ((note + '#') !== normalizedRoot) {
                blackKey.onclick = (e) => {
                    e.stopPropagation();
                    toggleNote(container, note + '#');
                };
            }
            
            key.appendChild(blackKey);
        }
    });
    
    container.insertBefore(pianoKeys, container.firstChild);
}

function toggleNote(container, note) {
    const rowIndex = parseInt(container.dataset.row);
    const colIndex = parseInt(container.dataset.col);
    const currentChord = chordProgression[rowIndex][colIndex];
    const { root, quality } = parseChord(currentChord);
    
    const pianoKeys = container.querySelector('.piano-keys');
    const targetKey = pianoKeys.querySelector(`[data-note="${note}"]`);
    const isActive = targetKey.classList.contains('active');
    
    const currentNotes = getChordNotes(currentChord)
        .map(n => n.replace(/[1-9]/, ''))
        .filter(n => n !== note);
    
    if (!isActive) {
        currentNotes.push(note);
    }
    
    currentNotes.sort((a, b) => {
        if (a === root) return -1;
        if (b === root) return 1;
        return 0;
    });
    
    const intervals = currentNotes.map(n => {
        const fromRoot = (noteToMidi[n] - noteToMidi[root] + 12) % 12;
        return fromRoot;
    });
    
    let newQuality = findClosestChordQuality(intervals);
    if (newQuality == '?') newQuality = quality;
    const newChord = `${root}|${newQuality}`;
    
    chordProgression[rowIndex][colIndex] = newChord;
    updateChordDisplay(rowIndex, colIndex, newChord);
}

function handleDragStart(e) {
    dragSrcElement = this;
    dragSrcRow = parseInt(this.dataset.row);
    dragSrcCol = parseInt(this.dataset.col);
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
    
    this.classList.add('dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    this.classList.add('over');
}

function handleDragLeave(e) {
    this.classList.remove('over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    if (dragSrcElement !== this) {
        const dragTargetRow = parseInt(this.dataset.row);
        const dragTargetCol = parseInt(this.dataset.col);
        
        // コード進行データの入れ替え
        const temp = chordProgression[dragTargetRow][dragTargetCol];
        chordProgression[dragTargetRow][dragTargetCol] = chordProgression[dragSrcRow][dragSrcCol];
        chordProgression[dragSrcRow][dragSrcCol] = temp;
        
        updateChordGrid();
        updateSourceCode();
    }
    
    return false;
}

function handleDragEnd(e) {
    const chordContainers = document.querySelectorAll('.chord-container');
    chordContainers.forEach(container => {
        container.classList.remove('over', 'dragging');
    });
}

function createChordContainer(chord, rowIndex, colIndex) {
    const chordContainer = document.createElement('div');
    chordContainer.className = 'chord-container';
    chordContainer.draggable = true;
    
    // ドラッグ＆ドロップに必要なデータ属性を追加
    chordContainer.dataset.row = rowIndex;
    chordContainer.dataset.col = colIndex;
    
    // ドラッグ＆ドロップイベントハンドラの登録
    chordContainer.addEventListener('dragstart', handleDragStart, false);
    chordContainer.addEventListener('dragenter', handleDragEnter, false);
    chordContainer.addEventListener('dragleave', handleDragLeave, false);
    chordContainer.addEventListener('dragover', handleDragOver, false);
    chordContainer.addEventListener('drop', handleDrop, false);
    chordContainer.addEventListener('dragend', handleDragEnd, false);
    
    const { root, quality } = parseChord(chord);
    const type = getChordType(quality);
    
    const notes = getChordNotes(chord);
    createPianoKeys(chordContainer, notes, root);
    
    const button = document.createElement('div');
    button.className = 'chord';
    button.textContent = chord.replace('|', '');
    button.dataset.type = type;
    button.onclick = () => { playChord(chord); };
    
    chordContainer.appendChild(button);
    chordContainer.appendChild(createChordSelector(rowIndex, colIndex));
    
    return chordContainer;
}

function updateChordGrid() {
    const grid = document.getElementById('chordGrid');
    grid.innerHTML = '';  // グリッドをクリア
    
    chordProgression.forEach((row, rowIndex) => {
        row.forEach((chord, colIndex) => {
            const chordContainer = createChordContainer(chord, rowIndex, colIndex);
            grid.appendChild(chordContainer);
        });
    });
}

function getChordNotes(chord) {
    const { root, quality, bassNote } = parseChord(chord);
    let notes = chordIntervals[quality].map(interval => { return getNoteAtInterval(root, interval); });
    if (bassNote && !notes.includes(bassNote)) { notes.unshift(bassNote); }
    return [...new Set(notes)];
}

function getNoteAtInterval(rootNote, semitones) {
    const notes = [
        'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
        'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'
    ];
    const rootIndex = notes.indexOf(rootNote);
    const targetIndex = (rootIndex + semitones) % 12;
    return notes[targetIndex];
}
