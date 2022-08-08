function createGrid(){
    const gridContainer = document.getElementById('gridContainer')
    const grid = document.createElement('table');
    grid.setAttribute('id', 'dataGrid')

    const thead = grid.createTHead();
    const tbody = grid.createTBody();

    for(let i = 0; i < height + 1; i++){
        if(i === 0){
            const tr = thead.insertRow();

            for(let j = 0; j < width + 1; j++){
                if(j === 0){
                    const td = tr.insertCell();
                    const refreshButton = document.createElement('button');
                    refreshButton.addEventListener("click", loadGrid)
                    refreshButton.appendChild(document.createTextNode('Refresh'));
                    td.appendChild(refreshButton);
                }
                else if(j !== 0){
                    const td = tr.insertCell();
                    td.appendChild(document.createTextNode(getColumnName(j-1)));
                    td.setAttribute("scope", "col")
                }
            }
        }
        else{
            const tr = tbody.insertRow();

            for(let j = 0; j < width + 1; j++){
                if(j === 0){
                    const td = tr.insertCell();
                    td.appendChild(document.createTextNode(`${i}`));
                    td.setAttribute("scope", "row")
                }
                else{
                    const input = document.createElement('input');
                    input.type = "text";
                    input.setAttribute("id",`${i-1}_${j-1}`);
                    input.setAttribute("class", "grid-input");
                    input.value = dataArray[i-1][j-1].display;
                    input.addEventListener("focus", showRaw);
                    input.addEventListener("blur", showDisplay);
                    const td = tr.insertCell();
                    td.appendChild(input);
                    td.setAttribute("class", "grid-cell");
                }
            }
        }

        
    }

    gridContainer.appendChild(grid);
}

function getColumnName(i){
    let n = 0
    do{
        n ++;
    }while(columnHeaders.length*(n) < (i + 1))

    if(n > 1){
        return `${columnHeaders[n-2]}${columnHeaders[i - columnHeaders.length*(n-1)]}`;
    }
    else{
        return `${columnHeaders[i]}`;
    }
}

function getColumnIndex(name){
    const columnLetters = name.split();
    let result = null;
    // Could probably do this recursively
    if(columnLetters.length == 1){
        result = columnHeaders.findIndex(columnLetters[0]);
    }
    else if(columnLetters.length == 2){
        const firstIndex = columnHeaders.findIndex(columnLetters[0]);
        const secondIndex = columnHeaders.findIndex(columnLetters[1]);

        result = (firstIndex * columnHeaders.length + secondIndex);
    }

    return result;
}

function createColumnHeaders(){
    const charIndexes = Array.from(Array(26)).map((e, i) => i + 65);
    const columnHeaders = charIndexes.map((x) => String.fromCharCode(x));

    return columnHeaders;
}

function showRaw(e){
    const input = e.currentTarget;
    const indexes = input.id.split('_');
    input.value = dataArray[indexes[0]][indexes[1]].raw;
}

function showDisplay(e){
    const input = e.currentTarget;
    const raw = input.value;
    const display = calculateDisplay(raw);
    const indexes = input.id.split('_');
    dataArray[indexes[0]][indexes[1]] = new CellData(raw, display);
    input.value = dataArray[indexes[0]][indexes[1]].display;
}

function calculateDisplay(raw){
    if(raw[0] !== "="){
        return raw;
    } 

    let rawFormula = raw.substring(1);

    if(raw[0] === "="){
        
        rawFormula = getFormulaValues(rawFormula);
    }

    const isSafe = new RegExp(/^[\d\s.()+"*-]+$/g).test(rawFormula);

    if(isSafe){
        return eval(rawFormula);
    }
    
    
    return raw;
}

// This could be expanded with methods extracted for handling functions first.
// Using a predefined list of possible functions with given inputs we would 
// want to start at a top level and work down to resolve any nested situations.
// Using similar logic to replace the string parts of each function, we could
// then apply the same replace cell logic for anything remaining.
// This should give us a a string of numbers and basic operators to evaluate
function getFormulaValues(rawFormula){
    const regex = new RegExp(/([A-Z]{2}\d+)|([A-Z]{1}\d+)/g);
    const allCells = rawFormula.match(regex);

    if(allCells !== null){
        const uniqueCells = allCells.filter((v, i, a) => a.indexOf(v) === i);
        let cellValueDict = new Object();
        for(let i = 0; i < uniqueCells.length; i++){
            const cellValue = getCellValue(uniqueCells[i]);
            if(cellValue !== null){
                rawFormula = rawFormula.replace(uniqueCells[i], cellValue);
            }
        }
    }

    return rawFormula
}

function getCellValue(cellName){
    const columnName = cellName.match(/[A-Z]{2}|[A-Z]{1}/g)[0];
    let columnIndex = -1;
    if(columnName.length === 1){
        columnIndex = columnHeaders.indexOf(columnName);
    }
    else if(columnName.length == 2){
        const firstLetterIndex = columnHeaders.indexOf(columnName[0]);
        const secondLetterIndex = columnHeaders.indexOf(columnName[1]);
        columnIndex = ((firstLetterIndex + 1)*columnHeaders.length + secondLetterIndex)
    }
    else{
        return  null;
    }

    const rowIndex = parseInt(cellName.match(/[\d]{3}|[\d]{2}|[\d]{1}/g)[0]) - 1;
    const value = dataArray[rowIndex][columnIndex].display;
    return value.length === 0 ? "0" : value;
}

function loadGrid(){
    const loadingContainer = document.getElementById('loadingContainer');
    const gridContainer = document.getElementById('gridContainer');
    showLoading(loadingContainer, gridContainer);
    createGrid();
    setTimeout(showGrid, 500, loadingContainer, gridContainer);
}

function showLoading(loadingElement, gridElement){
    hideElement(gridElement);
    showElement(loadingElement);
}

function showGrid(loadingElement, gridElement){
    hideElement(loadingElement);
    showElement(gridElement);
}

function showElement(element){
    if(element.hidden){
        element.hidden = false;
    }
}

function hideElement(element){
    if(!element.hidden){
        element.hidden = true;
    }
}

class CellData{
    constructor(raw = '', display = '',){
        this.raw = raw;
        this.display = display;
    }
}

const height = 100;
const width = 100;
const columnHeaders = createColumnHeaders();


let dataArray = [...Array(height)].map(e => Array(width).fill(new CellData()));

loadGrid();