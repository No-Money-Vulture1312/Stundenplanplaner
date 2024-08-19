let currentCursorColor = ''; // Variable für die aktuelle Cursor-Farbe
const scrollThreshold = 100;

document.addEventListener('DOMContentLoaded', function() {
    function createShootingStar() {
        const star = document.createElement('div');
        star.classList.add('shooting-star');

        // Zufällige Position auf dem Bildschirm
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;

        // Zufällige Dauer der Animation
        const duration = Math.random() * 30 + 1; // Dauer zwischen 10 und 30 Sekunden

        // Zufälliger Winkel für die Bewegung
        const angle = Math.random() * 360;

        // Stil für die Sternschnuppe festlegen
        star.style.left = `${startX}px`;
        star.style.top = `${startY}px`;
        star.style.animationDuration = `${duration}s`;
        star.style.transform = `rotate(${angle}deg)`;

        document.body.appendChild(star);

        // Entfernen Sie die Sternschnuppe, nachdem die Animation abgeschlossen ist
        star.addEventListener('animationend', () => {
            star.remove();
        });
    }

    // Erzeugt alle 500 Millisekunden eine neue Sternschnuppe
    setInterval(createShootingStar, 100);


    const filterButton = document.getElementById('filterButton');
    const settingsButton = document.getElementById('menuButton');
    const filterMenu = document.getElementById('filterMenu');
    const settingsMenu = document.getElementById('settingsMenu');
    const closesettingsMenuButton = document.getElementById('close-settingsMenu');
    let settingsMenuVisible = false;

    let openTimeoutId;
    let closeTimeoutId;

    // Funktion zum Öffnen des Menüs nach 0,5 Sekunden
    function startOpenTimeout() {
        openTimeoutId = setTimeout(() => {
            filterMenu.style.display = 'block';
        }, 100);
    }

    // Funktion zum Schließen des Menüs nach 1 Sekunde Inaktivität
    function startCloseTimeout() {
        closeTimeoutId = setTimeout(() => {
            filterMenu.style.display = 'none';
        }, 300);
    }

    // Event-Listener für den Button
    filterButton.addEventListener('mouseover', () => {
        clearTimeout(closeTimeoutId);
        startOpenTimeout();
    });

    filterButton.addEventListener('mouseout', () => {
        clearTimeout(openTimeoutId);
        startCloseTimeout();
    });

    filterMenu.addEventListener('mouseover', () => {
        clearTimeout(closeTimeoutId);
        clearTimeout(openTimeoutId);
    });

    filterMenu.addEventListener('mouseout', () => {
        startCloseTimeout();
    });


    // Button 4 - Sliding Menu
    settingsButton.addEventListener('click', openMenu);

    // Schließen Button im Sliding Menu
    closesettingsMenuButton.addEventListener('click', () => {
        settingsMenu.classList.remove('show');
        settingsMenuVisible = false;
    });
    
    // hier beginnt das neue

    const Stundenplan_Tables_div = document.querySelector("#Stundenplan_Tables_div");
    const Stundenplan_Tables_wrapper = Stundenplan_Tables_div.querySelector("#Stundenplan_Tables-wrapper");
    
    
    let isTicking = false;

    Stundenplan_Tables_div.addEventListener('scroll', () => {
        if (!isTicking) {
            window.requestAnimationFrame(() => {
                const totalHeight = Stundenplan_Tables_div.scrollHeight;
                const viewHeight = Stundenplan_Tables_div.clientHeight;
                const scrollTop = Stundenplan_Tables_div.scrollTop;

                const firstElement = Stundenplan_Tables_wrapper.firstElementChild;
                const lastElement = Stundenplan_Tables_wrapper.lastElementChild;
                const lastLabelNumberStundenplan = lastElement.querySelector(".Stundenplan_Counter");
                const firstLabelNumberStundenplan = firstElement.querySelector(".Stundenplan_Counter");
                let newCounter;

                if ((scrollTop + viewHeight + scrollThreshold >= totalHeight) && (parseInt(lastLabelNumberStundenplan.innerText) < parseInt(window.globalNumberOfSavedCombinations)) && (parseInt(window.globalNumberOfSavedCombinations) != 0)) {
                    console.log(window.globalNumberOfSavedCombinations)
                    newCounter = parseInt(lastLabelNumberStundenplan.innerText, 10) + 1;
                    firstLabelNumberStundenplan.innerText = newCounter.toString();

                    if (window.globalMainCombination) {
                        console.log("load next table");
                        const nextComb = findNextCombination(window.globalMainCombination);
                        updateMainTable(findNextCombination(nextComb), firstElement.querySelector(".StundenplanTable"));
                        window.globalMainCombination = nextComb;
                    }


                    Stundenplan_Tables_wrapper.appendChild(firstElement);
                } 
                
                else if ((scrollTop <= scrollThreshold) && (parseInt(firstLabelNumberStundenplan.innerText, 10) > 0)) {
                    newCounter = parseInt(firstLabelNumberStundenplan.innerText, 10) - 1;
                    lastLabelNumberStundenplan.innerText = newCounter.toString();

                    if (window.globalMainCombination) {
                        console.log("load previous table");
                        const lastComb = findPreviousCombination(window.globalMainCombination);
                        updateMainTable(findPreviousCombination(lastComb), lastElement.querySelector(".StundenplanTable"));
                        window.globalMainCombination = lastComb;
                    }

                    Stundenplan_Tables_wrapper.prepend(lastElement);
                }

                isTicking = false;
            });

            isTicking = true;
        }
    });


    // hier endet das neue

     

     // Farbauswahl-Buttons
     const greenOutlineButton = document.getElementById('greenOutlineButton');
     const redCrossButton = document.getElementById('redCrossButton');

     greenOutlineButton.addEventListener('click', () => setCursorColor('green'));
     redCrossButton.addEventListener('click', () => setCursorColor('red'));

     // Tabellenzellen
    console.log("Auf Tabellen klicken muss noch angepasst werdne")
    const all_Stundenplan_Tables = document.querySelectorAll('#Stundenplan_Tables-wrapper .StundenplanTable');

    all_Stundenplan_Tables[0].querySelectorAll('td').forEach(cell => {
          cell.addEventListener('click', handleTableCellClick);
    });
    all_Stundenplan_Tables[1].querySelectorAll('td').forEach(cell => {
        cell.addEventListener('click', handleTableCellClick);
    });
    all_Stundenplan_Tables[2].querySelectorAll('td').forEach(cell => {
        cell.addEventListener('click', handleTableCellClick);
    });

    document.addEventListener('keydown', handleKeyPress);

    const filterWithColourButton = document.getElementById('Load-Filtered-Plans');
    filterWithColourButton.addEventListener('click', filterWithColour)

    // Submenu
    document.querySelectorAll('#settingsMenu .add-item-btn').forEach(button => {
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
      TotalNumberlabel.innerText = `${window.globalNumberOfSavedCombinations}`;

      createStartingTables();

      // close menu
      openMenu();
    });
});

function createStartingTables() {
    const all_Stundenplan_Tables = document.querySelectorAll('#Stundenplan_Tables-wrapper .StundenplanTable');

    let startingCombination = findNextCombination();
    updateMainTable(startingCombination, all_Stundenplan_Tables[0]);
    startingCombination = findNextCombination(startingCombination);
    updateMainTable(startingCombination, all_Stundenplan_Tables[1]);

    window.globalMainCombination = startingCombination;

    startingCombination = findNextCombination(startingCombination);
    updateMainTable(startingCombination, all_Stundenplan_Tables[2]);

    // change labels
    const labels = document.querySelectorAll('#Stundenplan_Tables-wrapper .Stundenplan_Counter');
    labels[0].innerText = 0;
    labels[1].innerText = 1;
    labels[2].innerText = 2;
}

function saveOriginalActiveCells() {
  const loadedData = window.globalSavedModulMeta;
  let timesList = convertDictionaryToNumbersList(loadedData);

  // jetzt gucken und eliminieren wir alle, die nur einmal da basierend
  let vorlesungList = timesList.filter(sublist => sublist.length === 1);
  let singleElements = vorlesungList.map(sublist => sublist[0]);

  // 2. Neue Liste erstellen ohne die Einzelelemente in den Unterlisten mit mehr als einem Element
  let filteredList = timesList.map(sublist =>
      sublist.length > 1 ? sublist.filter(element => !singleElements.includes(element)) : sublist
  );

  window.globalActiveTimes = filteredList;

  console.log("Active Cells saved succsesfuly")
}


function updateMainTable(combination, table) {
  // hier laden ir erstmal eine Liste an veranstaltungen, damit wir auch wissen as die combination bedeutet
  const loadedData = window.globalSavedModulMeta;
  const namesList = [];
  for (const subject in loadedData) {
      for (const category in loadedData[subject]) {
          namesList.push(`${subject} - ${category}`);
      }
  }

  // einmal die Tabelle leer machen
  for (let r=1; r<=5; r++) {
    for (let c=1; c<=6; c++) {
      let cell = table.rows[c].cells[r];
      cell.textContent = '';
    }
  }

  for (let counter = 0; counter < combination.length; counter++) {
      let cell = [Math.floor(combination[counter]/6), combination[counter]%6];
      updateMainTableCell(cell, table, namesList[counter]);
  }
}

function updateMainTableCell(cell, table, name='') {
  // Tabelle finden
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
    const timesList = window.globalActiveTimes;

    // Berechnen aller möglichen Kombinationen
    let totalCombinations = calculateAllPossibleCombinations_help(timesList);

    // Speichern der Anzahl der gefundenen Kombinationen im lokalen Speicher
    window.globalNumberOfSavedCombinations = totalCombinations

    // Nachricht an den Server senden
    console.log(`${totalCombinations} valid combinations found. Saved`);
}

function findNextCombination(startCombination = null) {
    const lists = window.globalActiveTimes;
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


    console.log("Load Table succsesfully");

    return combination;
}

function findPreviousCombination(startCombination = null) {
    const lists = window.globalActiveTimes;
    
    // Hilfsfunktion, um zu prüfen, ob eine Kombination keine doppelten Zahlen enthält
    function isValidCombination(combination) {
        return new Set(combination).size === combination.length;
    }

    // Funktion zum Verringern der Kombination
    function decrementCombination(combination, indices) {
        let borrow = 1;
        for (let i = lists.length - 1; i >= 0; i--) {
            if (borrow === 0) break;

            indices[i] -= borrow;
            borrow = 0;

            if (indices[i] < 0) {
                indices[i] = lists[i].length - 1;
                borrow = 1;
            }
        }
    }

    // Initialisierung der Startkombination und Indizes
    let indices = startCombination
        ? startCombination.map((num, i) => lists[i].indexOf(num))
        : new Array(lists.length).fill(lists[0].length - 1);

    let combination = indices.map((index, i) => lists[i][index]);

    // Falls keine Startkombination gegeben ist, prüfen wir die erste Kombination
    if (startCombination === null && isValidCombination(combination)) {
        return combination;
    }

    do {
        decrementCombination(combination, indices);
        combination = indices.map((index, i) => lists[i][index]);

        let allAtMax = true;
        for (let i = 0; i < indices.length; i++) {
            if (indices[i] !== lists[i].length - 1) {
                allAtMax = false;
                break;
            }
        }

        if (allAtMax) {
            // Wenn wir wieder bei der letzten Kombination sind, ist keine gültige Kombination verfügbar
            return null;
        }
    } while (!isValidCombination(combination));

    console.log("Load Table successfully");

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

            //console.log(`Veranstaltung: ${veranstaltungName}`);  // Send specific Veranstaltung name

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
    window.globalSavedModulMeta = module_meta;
    console.log("Module saved successfully");
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

    const settingsMenu = document.getElementById('settingsMenu');
    const moduleMenu = settingsMenu.querySelector('.moduleMenu');
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

    settingsMenu.scrollTop = 0;
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
    const lists = window.globalActiveTimes;

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

    window.globalActiveTimes = filteredLists;

    calculateTotalNumber();

    let TotalNumberlabel = document.getElementById("Number-of-Plans-Display");
    TotalNumberlabel.innerText = `${window.globalNumberOfSavedCombinations}`;

    createStartingTables();

    console.log("Filtered active times. reload to reset");
}

function setCursorColor(color) {
    document.body.style.cursor = 'crosshair';
    currentCursorColor = color;
}

function handleTableCellClick(event) {
    const target = event.currentTarget;

    col = target.cellIndex;
    row = target.parentNode.rowIndex;

    if (col === 0) {
        return; // Keine Aktion für Zellen in der ersten Spalte
    }

    target.classList.remove('green-cell', 'red-cell');

    if (currentCursorColor === 'green') {
        target.classList.add('green-cell');
    } else if (currentCursorColor === 'red') {
        target.classList.add('red-cell');
    }

    const all_Stundenplan_Tables = document.querySelectorAll('#Stundenplan_Tables-wrapper .StundenplanTable');

    for (let i = 0; i<3; i++) {
        const cell = all_Stundenplan_Tables[i].rows[row].cells[col];

        cell.classList.remove('green-cell', 'red-cell');

        if (currentCursorColor === 'green') {
            cell.classList.add('green-cell');
        } else if (currentCursorColor === 'red') {
            cell.classList.add('red-cell');
        }
    }
}

function handleOutsideClick(event) {
    // Überprüfen, ob der Klick außerhalb der Tabelle war
    if (!event.target.closest('.Stundenplantable') && !event.target.closest('#settingsMenu')) {
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
    console.log("Grüne Felder muss ich erst noch machen.");
    const cellStates = [];
    const all_Stundenplan_Tables = document.querySelectorAll('#Stundenplan_Tables-wrapper .StundenplanTable');
    const rows = Array.from(all_Stundenplan_Tables[0].querySelectorAll('tbody tr'));

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
  const settingsMenu = document.getElementById('settingsMenu');

      if (settingsMenu.classList.contains('show')) {
         settingsMenu.classList.remove('show');
     } else {
         settingsMenu.classList.add('show');
     }
}
