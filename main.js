let currentCursorColor = ''; // Variable für die aktuelle Cursor-Farbe

document.addEventListener('DOMContentLoaded', function() {

     var nextTable = document.getElementById('Load-Next-Table-Button');
     nextTable.addEventListener('click', loadNextTable);

     const menuButton = document.getElementById('menuButton');
     menuButton.addEventListener('click', openMenu);

     // Farbauswahl-Buttons
     const greenOutlineButton = document.getElementById('greenOutlineButton');
     const redCrossButton = document.getElementById('redCrossButton');

     greenOutlineButton.addEventListener('click', () => setCursorColor('green'));
     redCrossButton.addEventListener('click', () => setCursorColor('red'));

     // Tabellenzellen
     document.querySelectorAll('#planTable td').forEach(cell => {
          cell.addEventListener('click', handleTableCellClick);
     });

    document.addEventListener('keydown', handleKeyPress);

    const filterWithColourButton = document.getElementById('Load-Filtered-Plans');
    filterWithColourButton.addEventListener('click', filterWithColour)

    // Submenu
    document.querySelectorAll('#sideMenu .add-item-btn').forEach(button => {
        button.addEventListener('click', function(event) {
            event.stopPropagation();
            addSubMenuItem(event.target.nextElementSibling);
        });
    });

    const loadOriginalPlanButton = document.querySelector('.load-original-plan');
    loadOriginalPlanButton.addEventListener('click', () => {
        loadPrePlanedModules();
    });

    const saveModuleMenutablesButton = document.querySelector('.berechne-Kombinationen');
    saveModuleMenutablesButton.addEventListener('click', () => {
      saveModuleMenutables();
      saveOriginalActiveCells();
      calculateTotalNumber();

      let TotalNumberlabel = document.getElementById("Number-of-Plans-Display");
      TotalNumberlabel.innerText = `${loadData('Number of saved Combinations')}`;

      const startingCombination = findNextCombination();
      updateMainTable(startingCombination);

      // close menu
      openMenu();
    });
});

function saveOriginalActiveCells() {
  const loadedData = loadData('Saved Modules Meta');
  let timesList = convertDictionaryToNumbersList(loadedData);

  // jetzt gucken und eliminieren wir alle, die nur einmal da basierend
  let vorlesungList = timesList.filter(sublist => sublist.length === 1);
  let singleElements = vorlesungList.map(sublist => sublist[0]);

  // 2. Neue Liste erstellen ohne die Einzelelemente in den Unterlisten mit mehr als einem Element
  let filteredList = timesList.map(sublist =>
      sublist.length > 1 ? sublist.filter(element => !singleElements.includes(element)) : sublist
  );

  localStorage.setItem("Active Times", JSON.stringify(filteredList));

  sendMessageToServer("Active Cells saved succsesfuly")
}

function loadNextTable() {
  const combinationNow = loadData("mainCombination");
  const nextCombination = findNextCombination(combinationNow);
  updateMainTable(nextCombination);
}

function updateMainTable(combination) {
  // hier laden ir erstmal eine Liste an veranstaltungen, damit wir auch wissen as die combination bedeutet
  const loadedData = loadData('Saved Modules Meta');
  const namesList = [];
  for (const subject in loadedData) {
      for (const category in loadedData[subject]) {
          namesList.push(`${subject} - ${category}`);
      }
  }

  // einmal die Tabelle leer machen
  let table = document.getElementById('planTable');
  for (let r=1; r<=5; r++) {
    for (let c=1; c<=6; c++) {
      let cell = table.rows[c].cells[r];
      cell.textContent = '';
    }
  }

  for (let counter = 0; counter < combination.length; counter++) {
      let cell = [Math.floor(combination[counter]/6), combination[counter]%6];
      updateMainTableCell(cell, namesList[counter]);
  }
}

function updateMainTableCell(cell, name='') {
  // Tabelle finden
  let table = document.getElementById('planTable');
  let row = cell[1]+1;
  let col = cell[0]+1;

  if (table && table.rows[row] && table.rows[row].cells[col]) {
      let tableCell = table.rows[row].cells[col];

      tableCell.textContent = name;
  } else {
      console.error('Die angegebene Zelle existiert nicht.');
  }
}

// die fnkt kann ich später löschen
function calculateTotalNumber() {
    // Laden der gespeicherten Moduldaten (dies wird später für etwas anderes wichtig sein)
    const timesList = loadData('Active Times');

    // Berechnen aller möglichen Kombinationen
    let totalCombinations = calculateAllPossibleCombinations_help(timesList);

    // Speichern der Anzahl der gefundenen Kombinationen im lokalen Speicher
    localStorage.setItem("Number of saved Combinations", JSON.stringify(totalCombinations));

    // Nachricht an den Server senden
    sendMessageToServer(`${totalCombinations} valid combinations found. Saved`);
}

function findNextCombination(startCombination = null) {
    const lists = loadData('Active Times');
    // Hilfsfunktion, um zu prüfen, ob eine Kombination keine doppelten Zahlen enthält
    function isValidCombination(combination) {
        return new Set(combination).size === combination.length;
    }

    // Funktion zum Erhöhen der Kombination
    function incrementCombination(combination, indices) {
        let carry = 1;
        for (let i = lists.length - 1; i >= 0; i--) {
            if (carry === 0) break;

            indices[i] += carry;
            carry = 0;

            if (indices[i] >= lists[i].length) {
                indices[i] = 0;
                carry = 1;
            }
        }
    }

    // Initialisierung der Startkombination und Indizes
    let indices = startCombination
        ? startCombination.map((num, i) => lists[i].indexOf(num))
        : new Array(lists.length).fill(0);

    let combination = indices.map((index, i) => lists[i][index]);

    // Falls keine Startkombination gegeben ist, prüfen wir die erste Kombination
    if (startCombination === null && isValidCombination(combination)) {
        return combination;
    }

    do {
        incrementCombination(combination, indices);
        combination = indices.map((index, i) => lists[i][index]);

        if (indices.every(index => index === 0)) {
            // Wenn wir wieder bei der ersten Kombination sind, ist keine gültige Kombination verfügbar
            return null;
        }
    } while (!isValidCombination(combination));

    //vermutlich temporär
    localStorage.setItem("mainCombination", JSON.stringify(combination));

    sendMessageToServer("Load Table succsesfully");

    return combination;
}

function convertDictionaryToNumbersList(dictionary) {
    const timesList = [];

    // Iteriere über alle Hauptschlüssel
    for (const mainKey in dictionary) {
        if (dictionary.hasOwnProperty(mainKey)) {
            const subObj = dictionary[mainKey];

            // Iteriere über alle Unterkategorien
            for (const subKey in subObj) {
                if (subObj.hasOwnProperty(subKey)) {
                    const timesArray = subObj[subKey]['times'];

                    // Füge die Ergebnisse zur Liste der Zeiten hinzu
                    timesList.push(timesArray);
                }
            }
        }
    }

    // Rückgabe der Liste aller Zeitkombinationen
    return timesList;
}


function calculateAllPossibleCombinations_help(lists, usedElements = new Set(), idx = 0) {
    if (idx === lists.length) {
        return 1;
    }
    let count = 0;
    for (let elem of lists[idx]) {
        if (!usedElements.has(elem)) {
            usedElements.add(elem);
            count += calculateAllPossibleCombinations_help(lists, new Set(usedElements), idx + 1);
            usedElements.delete(elem);
        }
    }
    return count;
}

function loadData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function saveModuleMenutables() {
    // Get Status of last
    const modules_container = document.getElementById('modules_submenu');
    const module_meta = {};  // "Test": {name: {num_veran: 2, times=[]}}

    const moduleElements = modules_container.querySelectorAll('.submenu-item');

    moduleElements.forEach(moduleElement => {
        const module = moduleElement.querySelector('.submenu');
        if (!module) return;

        const moduleNameElement = moduleElement.querySelector('.create-module-menu-module-text');
        const moduleName = moduleNameElement ? moduleNameElement.textContent.trim() : '';
        if (!moduleName) return;

        if (!module_meta[moduleName]) {
            module_meta[moduleName] = {};
        }

        const veranstaltungElements = module.querySelectorAll('.subsubmenu-item');

        veranstaltungElements.forEach(veranstaltungElement => {
            const veranstaltung = veranstaltungElement.querySelector('.submenu');
            const veranstaltungNameElement = veranstaltungElement.querySelector('.create-module-menu-module-text');
            const veranstaltungName = veranstaltungNameElement ? veranstaltungNameElement.textContent.trim() : '';
            if (!veranstaltungName) return;

            //sendMessageToServer(`Veranstaltung: ${veranstaltungName}`);  // Send specific Veranstaltung name

            const subsubmenu = veranstaltungElement.querySelector('.subsubmenu');
            if (!subsubmenu) return;

            const table = subsubmenu.querySelector('.subsubmenu-item-table');
            if (!table) return;

            const times = extractMarkedTimesFromTable(table) || [];  // Ensure `times` is an array

            module_meta[moduleName][veranstaltungName] = {
                times: times,
                num_times: times.length
            };
        });
    });

    // Save and send data
    localStorage.setItem("Saved Modules Meta", JSON.stringify(module_meta));
    sendMessageToServer("Module saved successfully");
}

function extractMarkedTimesFromTable(table) {
    const times = [];
    const rows = table.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        for (let j = 2; j < cells.length; j++) {
            if (cells[j].classList.contains('marked')) {
              let z = i*6 + (j-2);
                times.push(z);
            }
        }
    }

    return times;
}


function loadPrePlanedModules() {
    // jetzt füge ich hier den ganzen spaß aus python ein und initialisiere den gleich mal mit

    const prePlanned = {
      "BIWI02": {
        "Seminar": [[1, [0, 1, 2, 3]], [2, [0, 2, 3, 4]], [3, [0, 1]], [4, [0, 1]]]
      },
      "BIWI03": {
        "Seminar": [[0, [2, 3]], [1, [1, 2]], [2, [2, 3, 4]], [3, [1, 2, 3, 4]], [4, [1, 2]]]
      },
      "Lernen": {
        "SE01": [[1, [1, 3]], [3, [2]]],
        "SE02": [[2, [3]], [3, [2, 3]]],
        "Vorlesung": [[0, [4]]]
      },
      "Deutsch": {
        "Seminar": [[0, [1]], [2, [1, 4]]],
        "Vorlesung": [[3, [1]]]
      },
      "Werken": {
        "Übung 02": [[0, [2, 3]], [2, [2]], [3, [2, 3]]]
      },
      "Sachunterricht": {
        "SE01": [[0, [1, 2, 3, 4]], [1, [1, 3]], [2, [0, 3, 4]], [3, [0, 1, 2]], [4, [0, 1]]],
        "SE02": [[0, [1, 2, 3]], [2, [1, 4]], [3, [4]], [4, [1, 2]]],
        "Vorlesung": [[1, [2]]]
      }
    }

    const sideMenu = document.getElementById('sideMenu');
    const moduleMenu = sideMenu.querySelector('.moduleMenu');
    const submenu = moduleMenu.querySelector('.submenu');

    for (let module in prePlanned) {
        addSubMenuItem(submenu, module);

        for (let veran in prePlanned[module]) {
            let subsubmenu = submenu.querySelector('.submenu-item:last-of-type .submenu');

            addSubSubMenuItem(subsubmenu, veran);

            let table = subsubmenu.querySelector('.subsubmenu-item:last-of-type .subsubmenu .subsubmenu-item-table');
            let times = prePlanned[module][veran];
            for (let obersterCounter = 0; obersterCounter < times.length; obersterCounter++) {
                let x = times[obersterCounter][0];
                let day_times = times[obersterCounter][1];
                table.rows[x].cells[0].classList.toggle('marked');

                for (let i = 0; i < day_times.length; i++) {
                    let y = day_times[i] + 2;
                    table.rows[x].cells[y].classList.toggle('marked');
                }
            }
        }
    }
}

function addSubMenuItem(submenu, moduleName = 'Modul') {
    if (submenu && submenu.classList.contains('submenu')) {
        var newItem = document.createElement('div');
        newItem.classList.add('submenu-item');
        newItem.innerHTML = `
            <span class="create-module-menu-module-text" contenteditable="true">${moduleName}</span>
            <button class="add-subitem-btn">+</button>
            <button class="remove-item-btn">-</button>
            <div class="submenu"></div> <!-- Neues Submenu wird hier hinzugefügt -->
        `;
        submenu.appendChild(newItem);

        // Event-Listener für neu hinzugefügte Buttons setzen
        setEventListenersForNewItem(newItem);
    }
}

function addSubSubMenuItem(submenu, veranstaltungsName = 'Veranstaltung') {
    if (submenu && submenu.classList.contains('submenu')) {
        var newItem = document.createElement('div');
        newItem.classList.add('subsubmenu-item');
        newItem.innerHTML = `
            <span class="create-module-menu-module-text" contenteditable="true">${veranstaltungsName}</span> <!-- Das möchte ich später noch ändern -->
            <button class="remove-item-btn">-</button>
            <div class="subsubmenu">

              <table class="subsubmenu-item-table">
                  <tbody>
                      <tr>
                        <td class="day">Montag</td>
                        <td class="gap"></td>
                        <td class="time">7:15</td>
                        <td class="time">9:15</td>
                        <td class="time">11:15</td>
                        <td class="time">13:15</td>
                        <td class="time">15:15</td>
                        <td class="time">17:15</td>
                      </tr>
                      <tr>
                        <td class="day">Montag</td>
                        <td class="gap"></td>
                        <td class="time">7:15</td>
                        <td class="time">9:15</td>
                        <td class="time">11:15</td>
                        <td class="time">13:15</td>
                        <td class="time">15:15</td>
                        <td class="time">17:15</td>
                      </tr>
                      <tr>
                        <td class="day">Mittwoch</td>
                        <td class="gap"></td>
                        <td class="time">7:15</td>
                        <td class="time">9:15</td>
                        <td class="time">11:15</td>
                        <td class="time">13:15</td>
                        <td class="time">15:15</td>
                        <td class="time">17:15</td>
                      </tr>
                      <tr>
                        <td class="day">Donnerstag</td>
                        <td class="gap"></td>
                        <td class="time">7:15</td>
                        <td class="time">9:15</td>
                        <td class="time">11:15</td>
                        <td class="time">13:15</td>
                        <td class="time">15:15</td>
                        <td class="time">17:15</td>
                      </tr>
                      <tr>
                        <td class="day">Freitag</td>
                        <td class="gap"></td>
                        <td class="time">7:15</td>
                        <td class="time">9:15</td>
                        <td class="time">11:15</td>
                        <td class="time">13:15</td>
                        <td class="time">15:15</td>
                        <td class="time">17:15</td>
                      </tr>
                  </tbody>
              </table>

            </div>
        `;
        submenu.appendChild(newItem);

        // Event-Listener für neu hinzugefügte Buttons setzen
        setEventListenersForNewItem(newItem);
    }
}

function setEventListenersForNewItem(item) {
    // Setze Event-Listener für add-subitem-btn
    item.querySelectorAll('.add-subitem-btn').forEach(button => {
        button.addEventListener('click', function(event) {
            event.stopPropagation();
            addSubSubMenuItem(event.target.nextElementSibling.nextElementSibling);
        });
    });

    // Setze Event-Listener für remove-item-btn
    item.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', function(event) {
            event.stopPropagation();
            removeMenuItem(event.target);
        });
    });

    item.querySelectorAll('.create-module-menu-module-text').forEach(menuText => {
        menuText.addEventListener('focus', (event) => {
            function selectAllText(element) {
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(element);
                selection.removeAllRanges();
                selection.addRange(range);
            }

            menuText.addEventListener('focus', (event) => {
                selectAllText(event.target);
            });

            menuText.addEventListener('dblclick', (event) => {
                selectAllText(event.target);
            });

            menuText.addEventListener('blur', () => {
                console.log('Text gespeichert:', menuText.textContent);
            });

            menuText.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault(); // Verhindert den Zeilenumbruch
                    menuText.blur(); // Entfernt den Fokus und speichert die Änderungen
                }
            });
        });
    });

    item.querySelectorAll('.subsubmenu').forEach(subsubmenu => {
      subsubmenu.querySelectorAll('.subsubmenu-item-table').forEach(table => {
        table.addEventListener('click', function(event) {

              const cell = event.target;
              if (cell.classList.contains('time')) {
                  const row = cell.parentElement;
                  const col = Array.from(row.children).indexOf(cell);
                  const dayCell = row.querySelector('.day');

                  // Toggle the marked class on the time cell
                  cell.classList.toggle('marked');

                  // Also mark/unmark the day cell
                  if (Array.from(row.querySelectorAll('.time')).some(timeCell => timeCell.classList.contains('marked'))) {
                      dayCell.classList.add('marked');
                  } else {
                      dayCell.classList.remove('marked');
                  }
              }
        });
      });
    });
}

function removeMenuItem(button) {
    var itemToRemove = button.parentElement;
    itemToRemove.remove();
}

// Filter

function filterWithColour() {
    // Holen der Zustände der Tabellenzellen
    const cellStates = getTableCellStates();
    const lists = loadData('Active Times');

    // get all red states später auch die grünen
    let redCells = [];
    for (let counter=0; counter<cellStates.length; counter++) {
      // red
      if (cellStates[counter] == -1) {
        redCells.push(counter)
      }
      //green
    }

    const filteredLists = lists.map(sublist =>
      sublist.filter(value => !redCells.includes(value))
    );

    localStorage.setItem("Active Times", JSON.stringify(filteredLists));

    calculateTotalNumber();

    let TotalNumberlabel = document.getElementById("Number-of-Plans-Display");
    TotalNumberlabel.innerText = `${loadData('Number of saved Combinations')}`;

    const startingCombination = findNextCombination();
    updateMainTable(startingCombination);

    sendMessageToServer("Filtered active times. reload to reset");
}

function setCursorColor(color) {
    document.body.style.cursor = 'crosshair';
    currentCursorColor = color;
}

function handleTableCellClick(event) {
    const target = event.currentTarget;

    if (target.cellIndex === 0) {
        return; // Keine Aktion für Zellen in der ersten Spalte
    }

    // Entfernen von vorherigen Markierungen
    target.classList.remove('green-cell', 'red-cell');

    // Markieren der aktuellen Zelle basierend auf dem Cursor
    if (currentCursorColor === 'green') {
        target.classList.add('green-cell');
    } else if (currentCursorColor === 'red') {
        target.classList.add('red-cell');
    }
}

function handleOutsideClick(event) {
    // Überprüfen, ob der Klick außerhalb der Tabelle war
    if (!event.target.closest('#planTable') && !event.target.closest('#sideMenu')) {
        resetCursorColor();
    }
}

function handleKeyPress(event) {
    // Überprüfen, ob die "X"-Taste gedrückt wurde
    if (event.key === 'x' || event.key === 'X') {
        resetCursorColor();
    }
}

function resetCursorColor() {
    document.body.style.cursor = 'default';
    currentCursorColor = ''; // Zurücksetzen der aktuellen Cursor-Farbe
}

function getTableCellStates() {
    sendMessageToServer("Grüne Felder muss ich erst noch machen.");
    const cellStates = [];
    const rows = Array.from(document.querySelectorAll('#planTable tbody tr'));

    // Annehmen, dass alle Zeilen die gleiche Anzahl an Spalten haben
    const columnCount = rows[0].querySelectorAll('td').length - 1; // -1 weil wir die erste Spalte überspringen

    // Durchlaufen der Zellen in jeder Spalte (reihenweise)
    for (let colIndex = 1; colIndex <= columnCount; colIndex++) {
        rows.forEach(row => {
            const cell = row.querySelectorAll('td')[colIndex];
            if (cell.classList.contains('green-cell')) {
                cellStates.push(1);
            } else if (cell.classList.contains('red-cell')) {
                cellStates.push(-1);
            } else {
                cellStates.push(0);
            }
        });
    }

    return cellStates;
}


function openMenu() {
  const sideMenu = document.getElementById('sideMenu');
  const content = document.getElementById('content');

      if (sideMenu.classList.contains('open')) {
         sideMenu.classList.remove('open');
         content.classList.remove('zoomed-out');
     } else {
         sideMenu.classList.add('open');
         content.classList.add('zoomed-out');
     }
}

function sendMessageToServer(message) {
  setTimeout(() => {
      fetch('/log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message })
    })
    .then(response => response.json())
    .then(data => console.log('Server antwortete:', data))
    .catch(error => console.error('Fehler:', error));
    }, 0);
}
