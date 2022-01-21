const QUANTUMSIZE = 50; // 1 QUANTUM
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
        comingTime: this.arrivalTime,
        wasChosenBefore: false
    }
    
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
        <div class="processName">${processName}</div>
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
        <div class="processName">${processName}</div>
        <div class="quantumTime">1</div>
    `;
    let htmlStringInterchange = `
        <div class="square"></div>
        <div class="quantumTime">${QUANTUMINTERCHANGE}</div>
    `;
    htmlElementProcess.innerHTML = htmlStringProcess;
    htmlElementInterchange.innerHTML = htmlStringInterhtmlElementInterchange;
    document.querySelector('.ganttList').appendChild(htmlElementProcess);
    document.querySelector('.ganttList').appendChild(htmlElementInterchange);
}

const showResults = ()=>{
    if(!processes.some(item => item.arrivalTime === 0)){
        alert('Ningún proceso tiene 0 como tiempo de llegada')
        document.querySelector('#arrivalTime').focus();
        
    } else {
        processes = sortJsonArray(processes);
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
        }

        for (let i = 0; i < 14; i++) {
            let chosenProcess = processes.find(process => process.needCPU != 0 && !process.wasChosenBefore/*Poner condición para E/S|| ( )*/);//Inicializamos el chosenProcess en un Proceso que necesite CPU
            processes[chosenProcess.name].wasChosenBefore = true;
            for (let i = 0; i < processes.length; i++) {//CICLO PARA RECORRER CADA PROCESO Y cuál será el enviado a la cola de procesos ene stado listo
                const currentProcess = processes[i];
                //Criterios para mandar a cola de listos
                if(currentProcess.needCPU != 0 && currentProcess.comingTime <= currentTime && !currentProcess.wasChosenBefore && currentProcess.comingTime < chosenProcess.comingTime){ //COMPROBAMOS SI EL EL PROCESO ACTUAL NECESITA MÁS CPU - Añadir si chosenProcess está vacío
                    processes[chosenProcess.name].wasChosenBefore = false;//En caso de que se escogió un proceso con menor prioridad
                    chosenProcess = currentProcess;
                    processes[i].wasChosenBefore = true;
                }
                // else if (currentProcess.InOut.length != 0){//ACÁ ENTRA SI EL PROCESO SE QUEDA SIN CPU, PERO TIENE E/S
                //     currentProcess.comingTime = currentTime + currentProcess.inOut[0].spendQuantum * QUANTUMSIZE;//CALCULAMOS EL TIEMPO EN EL QUE VUELVE EL PROCESO
                // }
            }

            //Momento de añadir a las colas

            addProcessToReadyQueue(chosenProcess.name, chosenProcess.needCPU);

            readyProcessQueue.push({
                name: chosenProcess.name,
                needCPU: chosenProcess.needCPU
            });
            processes[chosenProcess.name].needCPU --;
            
            processes[readyProcessQueue[0].name].wasChosenBefore = false;//Cambia el valor de que fue escogido antes del proceso anterior al que estamos parados
            readyProcessQueue[0].shift();//quitamos el proceso que estaba al frente de la cola
            
            // PARTE PARA AÑADIR AL DIAGRAMA DE GANTT
            addProcessToGanttDiagram(currentTime, currentTime + QUANTUMSIZE, chosenProcess.name);
            ganttDiagram.push({
                name: chosenProcess.name,
                msTimeBefore: currentTime,
                msTimeAfter: currentTime + QUANTUMSIZE
            });

            currentTime += QUANTUMSIZE + INTERCHANGE; // TIEMPO QUE LLEVAREMOS CADA QUE AÑADAMOS UN PROCESO AL DIAGRAMA DE GANTT
            if(processes[chosenProcess.name].needCPU != 0){
                processes[chosenProcess.name].comingTime = currentTime + QUANTUMSIZE ; //El coming time será el tiempo en el que terminan los procesos para compararse con los demás
            }
                //     // PINTAR UN ESPACIO COMO UN HUECO
                //     let htmlElement = document.createElement('li')
                //     htmlElement.classList.add('error')
                //     document.querySelector('.ganttList').appendChild(htmlElement);

                //     currentTime = processes[i].arrivalTime;
                //     i--;
        }


        // OTRA FORMA

        // //INICIALIZACIÓN DE COLA DE PROCESOS EN ESTADO LISTO
        // addProcessToReadyQueue(processes[0].name, processes[0].needCPU);
        // readyProcessQueue.push({
        //     name: processes[0].name,
        //     needCPU: processes[0].needCPU
        // });
        
        // // PARTE PARA AÑADIR AL DIAGRAMA DE GANTT
        // addProcessToGanttDiagram(currentTime, currentTime + QUANTUMSIZE, readyProcessQueue[0].name);
        // ganttDiagram.push({
        //     name: readyProcessQueue[0].name,
        //     msTimeBefore: currentTime,
        //     msTimeAfter: currentTime + QUANTUMSIZE
        // });

        // currentTime += QUANTUMSIZE + INTERCHANGE; // TIEMPO QUE LLEVAREMOS CADA QUE AÑADAMOS UN PROCESO AL DIAGRAMA DE GANTT
        
        // while(readyProcessQueue.length != 0){

        //     for (let i = 1; i < processes.length; i++) {
        //         if(processes[i].arrivalTime <= currentTime && readyProcessQueue[0].needCPU-1 === 0){
        //             // SE AÑADE EL PROCESO NUEVO A LA COLA DE LISTOS
        //             // SE BORRA EL PRIMER ELEMENTO DEL VECTOR

        //             // SE AÑADE AL DIAGRAMA DE GANTT
        //             // SE CAMBIA EL CURRENTTIME
        //         } else if(processes[i].arrivalTime <= currentTime && readyProcessQueue[0].needCPU-1 > 0){
        //             // SE AÑADE EL PROCESO NUEVO A LA COLA DE LISTOS
        //             // SE AÑADE EL PRIMER PROCESO A LA COLA CON LA CPU -1
        //             // SE BORRA EL PRIMER ELEMENTO DEL VECTOR

        //             // SE AÑADE AL DIAGRAMA DE GANTT
        //             // SE CAMBIA EL CURRENTTIME
        //         } else if(processes[i].arrivalTime > currentTime && readyProcessQueue[0].needCPU-1 === 0 && readyProcessQueue.length >= 2) {
        //             // SE AÑADE AL DIAGRAMA DE GANTT EL SEGUNDO ELEMENTO
        //             // SE CAMBIA EL CURRENTTIME
        //             // SE BORRA EL PRIMER ELEMENTO DEL VECTOR
        //         } else if(processes[i].arrivalTime > currentTime && readyProcessQueue[0].needCPU-1 > 0 && readyProcessQueue.length != 0) {
        //             // SE AÑADE AL DIAGRAMA DE GANTT EL PRIMER ELEMENTO
        //             // SE CAMBIA EL CURRENTTIME
        //             // SE AÑADE A LA COLA DE LISTOS CON LA CPU -1
        //             // SE BORRA EL PRIMER ELEMENTO DEL VECTOR
        //         } else if(processes[i].arrivalTime > currentTime && readyProcessQueue.length == 0){
        //             // NO EXPLICÓ EL PROFESOR COMO SE DEBERIA DE MOSTRAR

        //             //     // PINTAR UN ESPACIO COMO UN HUECO
        //             //     let htmlElement = document.createElement('li')
        //             //     htmlElement.classList.add('error')
        //             //     document.querySelector('.ganttList').appendChild(htmlElement);

        //             //     currentTime = processes[i].arrivalTime;
        //             //     i--;
        //         }
        //     }

        //     // CUANDO SE ACABA EL FOR Y TODOS LOS PROCESOS SON INGRESADOS A LA COLA DE LISTOS SE DEBE SEGUIR VALIDANDO
            


        // }
    }
}

addInOutButton.addEventListener('click', addInOut);
inputForm.addEventListener('submit', addProcess);
showResultsButton.addEventListener('click', showResults);