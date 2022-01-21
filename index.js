const QUANTUMSIZE = 20; // 1 QUANTUM
const INTERCHANGE = 10; // MILISECONDS
const QUANTUMINTERCHANGE = INTERCHANGE/QUANTUMSIZE; // 0.2 QUANTUM

const inputForm = document.querySelector('.inputForm');
const addInOutButton = document.querySelector('.addInOut');
const addProcessButton = document.querySelector('.addProcess');
const showResultsButton = document.querySelector('.showResults');
const processTitle = document.querySelector('.process__title');

let InOutData = [];
let processes = [];
let readyProcessQueue = [];
let ganttDiagram = [];
let temp = [];
let currentTime = 0;

document.querySelector('#arrivalTime').focus();

const addInOut = ()=>{
    InOutData.push({
        spendQuantum: parseInt(document.querySelector('#spendInOut').value),
        needCPU: parseInt(document.querySelector('#needCpuES').value)
    });

    document.querySelector('#spendInOut').value = '';
    document.querySelector('#needCpuES').value = '';
    document.querySelector('#spendInOut').focus();
}

const addProcess = (e)=>{
    e.preventDefault();

    let process = {
        name: processes.length,
        arrivalTime: parseInt(document.querySelector('#arrivalTime').value),
        needCPU: parseInt(document.querySelector('#needCpu').value),
        InOut: InOutData,
        comingTime: parseInt(document.querySelector('#arrivalTime').value),
        wasChosenBefore: false
    }

    InOutData = [];
    
    processes.push(process);

    processTitle.innerHTML = "Proceso " + processes.length;
    
    document.querySelector('#arrivalTime').value = '';
    document.querySelector('#needCpu').value = '';
    document.querySelector('#arrivalTime').focus();
}

const sortJsonArray = (jsonArrayToOrder) =>{
    for (let i = 0; i < jsonArrayToOrder.length; i++) {
        let min = jsonArrayToOrder[i];
        let minId = i;
        for (let j = i+1; j < jsonArrayToOrder.length; j++) {
            if (jsonArrayToOrder[j].arrivalTime < min.arrivalTime) {
                min = jsonArrayToOrder[j];
                minId = j;
            }
        }
        let temp = jsonArrayToOrder[i];
        jsonArrayToOrder[i] = min;
        jsonArrayToOrder[minId] = temp;
    }
    return jsonArrayToOrder;
}

const addProcessToReadyQueue = (processName, quantumCpu)=>{
    let htmlElement = document.createElement('li');
    let htmlString = `
        <div class="processName">P${processName}</div>
        <div class="quantumCpu">${quantumCpu}</div>
    `;
    htmlElement.innerHTML = htmlString;
    document.querySelector('.queueList').appendChild(htmlElement);
}

const addProcessToGanttDiagram  = (msTimeBefore, msTimeAfter, processName)=>{
    let htmlElementProcess = document.createElement('li');
    htmlElementProcess.classList.add('ganttList__process');
    let htmlElementInterchange = document.createElement('li');
    htmlElementInterchange.classList.add('ganttList__interchange');
    let htmlStringProcess = `
        <div class="msTime">
            <span class="msTime__before">${msTimeBefore}</span>
            <span class="msTime__after">${msTimeAfter}</span>
        </div>
        <div class="processName">P${processName}</div>
        <div class="quantumTime">1</div>
    `;
    let htmlStringInterchange = `
        <div class="square"></div>
        <div class="quantumTime">${QUANTUMINTERCHANGE}</div>
    `;
    htmlElementProcess.innerHTML = htmlStringProcess;
    htmlElementInterchange.innerHTML = htmlStringInterchange;
    document.querySelector('.ganttList').appendChild(htmlElementProcess);
    document.querySelector('.ganttList').appendChild(htmlElementInterchange);
}

const showResults = ()=>{
    if(!processes.some(item => item.arrivalTime === 0)){
        alert('Ningún proceso tiene 0 como tiempo de llegada')
        document.querySelector('#arrivalTime').focus();
        
    } else {
        processes = sortJsonArray(processes);

        //Se envía el proceso con tiempo 0

        addProcessToReadyQueue(processes[0].name, processes[0].needCPU);
        readyProcessQueue.push({
            name: processes[0].name,
            needCPU: processes[0].needCPU
        });
        processes[0].needCPU --;
        processes[0].wasChosenBefore = true;

        addProcessToGanttDiagram(currentTime, currentTime + QUANTUMSIZE, processes[0].name);
        ganttDiagram.push({
            name: processes[0].name,
            msTimeBefore: currentTime,
            msTimeAfter: currentTime + QUANTUMSIZE
        });

        currentTime += QUANTUMSIZE + INTERCHANGE;

        if(processes[0].needCPU != 0){
            processes[0].comingTime += QUANTUMSIZE + INTERCHANGE;
        }else if (processes[0].InOut.length != 0){ // Comprobar si tiene E/S y calcular su tiempo de llegada
            //En este momento el currentTime ya tuvo en cuenta el tiempo de ejecución del quantum que se gastó el proceso
            processes[0].comingTime = currentTime + (processes[0].InOut[0].spendQuantum * QUANTUMSIZE) ;//Calculamos su nuevo tiempo de llegada (ComingTime)
            //processes[chosenProcess.name].needCPU = processes[chosenProcess.name].InOut[0].needCPU;//Asignamos los quantums que necesita de cpu según la E/S
        }

        //Envío de los demás procesos

        while(processes.length != 0){
            let chosenProcess = processes.find(process => process.needCPU != 0 && !process.wasChosenBefore);//Inicializamos el chosenProcess en un Proceso que necesite CPU
            let chosenProcessId = processes.indexOf(chosenProcess);
            //debugger
            processes[chosenProcessId].wasChosenBefore = true;
            for (let i = 0; i < processes.length; i++) {//CICLO PARA RECORRER CADA PROCESO Y cuál será el enviado a la cola de procesos ene stado listo
                const currentProcess = processes[i];
                //Criterios para mandar a cola de listos
                if(currentProcess.needCPU != 0 && currentProcess.comingTime <= currentTime && !currentProcess.wasChosenBefore && currentProcess.comingTime < chosenProcess.comingTime){ //COMPROBAMOS SI EL EL PROCESO ACTUAL NECESITA MÁS CPU - Añadir si chosenProcess está vacío
                    processes[chosenProcessId].wasChosenBefore = false;//En caso de que se escogió un proceso con menor prioridad
                    chosenProcess = currentProcess;
                    chosenProcessId = processes.indexOf(chosenProcess);
                    processes[i].wasChosenBefore = true;
                }
            }

            //Momento de añadir a las colas

            addProcessToReadyQueue(chosenProcess.name, chosenProcess.needCPU);

            readyProcessQueue.push({
                name: chosenProcess.name,
                needCPU: chosenProcess.needCPU
            });
            processes[chosenProcessId].needCPU --;
            if (processes.indexOf(processes.find(process => process.name === readyProcessQueue[0].name)) != -1) {
                processes[processes.indexOf(processes.find(process => process.name === readyProcessQueue[0].name))].wasChosenBefore = false;//Cambia el valor de que fue escogido antes del proceso anterior al que estamos parados
            }
            temp.push(readyProcessQueue[0]);
            readyProcessQueue.shift();//quitamos el proceso que estaba al frente de la cola
            
            // PARTE PARA AÑADIR AL DIAGRAMA DE GANTT
            addProcessToGanttDiagram(currentTime, currentTime + QUANTUMSIZE, chosenProcess.name);
            ganttDiagram.push({
                name: chosenProcess.name,
                msTimeBefore: currentTime,
                msTimeAfter: currentTime + QUANTUMSIZE
            });

            //Actualización de tiempos

            currentTime += QUANTUMSIZE + INTERCHANGE; // TIEMPO QUE LLEVAREMOS CADA QUE AÑADAMOS UN PROCESO AL DIAGRAMA DE GANTT
            if(processes[chosenProcessId].needCPU != 0){
                processes[chosenProcessId].comingTime = currentTime; //El coming time será el tiempo en el que terminan los procesos para compararse con los demás, QUEDA EN DUDA SI SE TIENE O NO EN CUENTA EL INTERCAMBIO
            }else if (processes[chosenProcessId].InOut.length != 0){ // Comprobar si tiene E/S y calcular su tiempo de llegada
                //En este momento el currentTime ya tuvo en cuenta el tiempo de ejecución del quantum que se gastó el proceso
                processes[chosenProcessId].comingTime = currentTime + (processes[chosenProcessId].InOut[0].spendQuantum * QUANTUMSIZE) ;//Calculamos su nuevo tiempo de llegada (ComingTime)
                processes[chosenProcessId].needCPU = processes[chosenProcessId].InOut[0].needCPU;//Asignamos los quantums que necesita de cpu según la E/S
                processes[chosenProcessId].InOut.shift();//Quitamos la entrada y salida
            }else{
                //Sacar al proceso de la tabla
                processes = processes.filter(process => process.name != chosenProcess.name);
            }       
        }
        temp.push(readyProcessQueue[0]);
    }
}

addInOutButton.addEventListener('click', addInOut);
inputForm.addEventListener('submit', addProcess);
showResultsButton.addEventListener('click', showResults);