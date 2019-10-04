import { Component, OnInit, ɵConsole } from "@angular/core";

@Component({
  selector: "app-config-painel",
  templateUrl: "./config-painel.component.html",
  styleUrls: ["./config-painel.component.css"]
})
export class ConfigPainelComponent implements OnInit {
  probMutacao: number;
  probCruzamento: number;
  //resolution: number;
  populationSize: number;
  //intervalMax: number;
  //intervalMin: number;
  //minFunctionInTheInterval: number;
  //maxFunctionInTheInterval: number;
  maxNumOfGenerations: number;
  bestInd: individual[];
  numOfBestToKeep: number;
  numCurrentGeneration: number;
  generations: any[];
  couplesSelectionMode: string;
  checkBoxSelectedItens: string[];
  numOfIndividualsInTourney: number;
  numOfElitismInd: number;

  graphData: any;
  functionDataSet: any;
  generationsDataSets: any[];

  colors: string[];
  color: number;
  isGraphResponsive: boolean;
  showGraph1: string;
  showGraph2: string;
  performanceData: any;
  bestIndividualData: any;

  schedulingConfig: schedulingConfig;
  numOfIntervals: number;
  numOfVariables: number;

  constructor() {}

  ngOnInit() 
  {
    console.log("ngOnInit");

    this.probCruzamento = 0.6;
    this.probMutacao = 0.01;
    this.populationSize = 50;
    this.maxNumOfGenerations = 70;
    this.bestInd = [];
    this.numOfBestToKeep = 5;
    this.numCurrentGeneration = 0;
    this.generations = [];
    this.isGraphResponsive = true;
    this.showGraph1 = 'block';
    this.showGraph2 = 'none';
    this.couplesSelectionMode = "Roleta";
    this.checkBoxSelectedItens = ["elitism"];
    this.numOfIndividualsInTourney = 4;
    this.numOfElitismInd = 2;
    this.numOfIntervals = 4;
    this.initSchedulingConfig();
    this.numOfVariables = 7;

  }

  initSchedulingConfig()
  {
    let potDemandas = [80, 90, 65, 70];
    let capacities = [20, 15, 35, 40, 15, 15, 10];
    let numOfMaintenanceIntervals = [2, 2, 1, 1, 1, 1, 1];

    this.schedulingConfig = 
    {
      pt: this.sumArray(capacities),
      pd: potDemandas,
      machines: []
    }

    for (let index = 0; index < capacities.length; index++) 
    {
      let machine: MachineConfig = 
      {
        unitID: (index+1).toString(),
        capacity: capacities[index],
        numOfMaintenances: numOfMaintenanceIntervals[index],

      }
      this.schedulingConfig.machines.push(machine)
    }
    /*
    for (let index = 0; index < potDemandas.length; index++) 
    {
      let interval: Interval = 
      {
        pd: potDemandas[index]
      }
      this.schedulingConfig.intervals.push(interval)
    }
    */
    console.log("initSchedulingConfig", this.schedulingConfig);
  }

  numOfNewIndividual() 
  {
    let numOfNewIndividual: number;

    if (this.checkBoxSelectedItens.indexOf("elitism") >= 0) 
    {
      numOfNewIndividual = this.populationSize - this.numOfElitismInd;
    } 
    else
    {
      numOfNewIndividual = this.populationSize;
    }

    return numOfNewIndividual;
  }

  sumArray(array): number
  {
    let sum = 0;
    for (const iterator of array) {
      sum += iterator
    }
    return sum;
  }

  minArray(arr: number[]) 
  {
    let minValue = arr[0];
    for (let index = 1; index < arr.length; index++) 
    {
      ///se o minValue é mario que o elemento do array, então ele não o menor e deve ser trocado
      if (minValue > arr[index]) minValue = arr[index];
    }
    return minValue;
  }

  maxArray(arr: number[]) 
  {
    let maxValue = arr[0];
    for (let index = 1; index < arr.length; index++) {
      if (maxValue < arr[index]) maxValue = arr[index];
    }
    return maxValue;
  }

  getColorStr() 
  {
    return (
      "#" +
      this.color
        .toString(16)
        .toLocaleUpperCase()
        .padStart(6, "0")
    );
  }


  plotPerformanceGraph(generations: individual[][]) 
  {
    ///filling a vector with the generation numbers
    //console.log("plotPerformanceGraph");
    let xValues = [];
    for (let i = 0; i <= this.maxNumOfGenerations; i++) {
      xValues.push(i);
    }
    //console.log("xValues");
    //console.log(xValues);
    ///filling data (y values - best individuals fitness and average for every generation)
    let datasets: any[] = [];
    let bestIndividualFitnessDataset = {
      label: "Best individual",
      data: generations.map(element => {
        return this.bestIndividualFromAscendingPop(element).fitness;
      }),
      backgroundColor: undefined,
      borderColor: "#000000",
      fill: false,
      pointRadius: 2,
      pointHoverRadius: 2
      //showLine: false // no line shown
    };
    //console.log("generations");
    /* console.log(
      generations.map(element => {
        return this.bestIndividualFromAscendingPop(element).fitness;
      })
    ); */

    let averageFitnessDataset = {
      label: "Average fitness",
      data: generations.map(element => {
        return this.calcFitnessAverage(element);
      }),
      backgroundColor: "#eeeeff",
      borderColor: "#0000ff",
      pointRadius: 0,
      pointHoverRadius: 0,
      fill: true
      // showLine: false // no line shown
    };

    ///adding to the datasets graph
    datasets.push(bestIndividualFitnessDataset);
    datasets.push(averageFitnessDataset);

    ///updating the variable that were binded to the performance graph data
    this.performanceData = {
      animationEnabled: false, //change to false
      labels: xValues,
      datasets
    };

    this.bestIndividualData = {
      animationEnabled: false, //change to false
      labels: xValues,
      datasets: [bestIndividualFitnessDataset]
    };
  }

  /////////////////////

  optimize() 
  {
    console.log("optimize");

    ///restarting the variables

    this.generations = [];

    /// melhores indivíduos para a tabela
    this.bestInd = [];

    /// número da geração atual
    this.numCurrentGeneration = 0;

    let initialPopulation = this.selectInitialPopulation();

    ///getting a list starting with the worst individual
    let currentGeneration = this.getAscendingFitnessPopulation(initialPopulation);

    this.generations.push(currentGeneration);

    /// operations that we do for every generation
    while (this.generations.length <= this.maxNumOfGenerations) 
    {
      this.numCurrentGeneration++;

      ///this is not need since we are ordering in the end of the "for"
      //currentGeneration = this.getAscendingFitnessPopulation(currentGeneration);

      //console.log(currentGeneration);
      let nextGeneration: individual[] = [];
      let individualsToKeep: individual[] = [];

      /// if elitism is enable
      if (this.checkBoxSelectedItens.indexOf("elitism") >= 0) 
      {
        individualsToKeep = this.bestIndividualsFromAscendingPop(currentGeneration, this.numOfElitismInd);
      }

      this.applyCrossover(currentGeneration, nextGeneration);

      ///console here will show the final next population, since chrome update the objects in console
      this.applyMutation(nextGeneration);

      //console.log(nextGeneration);

      ///concating the best individuals that were kept
      nextGeneration = nextGeneration.concat(individualsToKeep);

      ///for keeping ordered lists
      nextGeneration = this.getAscendingFitnessPopulation(nextGeneration);

      this.generations.push(nextGeneration);
      currentGeneration = nextGeneration;
    }///while

    for (let i = 0; i < this.generations.length; i++) 
    {
      setTimeout(() => {
        //this.drawFunction(this.generationsDataSets.slice(i, i + 1));
      }, i * 2);
    }
    this.plotPerformanceGraph(this.generations);
    
    //console.log(this.generations);
  }

  getAscendingFitnessPopulation(population: individual[]): individual[] {
    //console.log("original")
    //console.log(population)
    let ordered: individual[] = [];
    ordered.push(population[0]);
    ///starting at 1, since we had already added 0th
    for (let i = 1; i < population.length; i++) 
    {
      let insertedIndividual = false;
      for (let j = 0; j < ordered.length; j++) 
      {
        //console.log("j" + ordered[j].fitness);
        ///if the fitness is less than some already inserted individual's fitness, insert it before
        if (population[i].fitness < ordered[j].fitness) 
        {
          ordered.splice(j, 0, population[i]);
          insertedIndividual = true;
          break;
        }
      }
      /// if it was not inserted, push it at the end, since it is the biggest value
      if (insertedIndividual === false) 
      {
        ordered.push(population[i]);
      }
    }
    /*console.log("getAscendingFitnessPopulation");
    console.log("first");
    console.log(ordered[0]);
    console.log("last");
    console.log(ordered[ordered.length - 1]);*/
    return ordered;
  }

  calcSumFits(population: individual[]): number 
  {
    let sumFits = 0;
    for (let ind of population) 
    {
      sumFits += ind.fitness;
    }
    //console.log("sumFits: " + sumFits);
    return sumFits;
  }

  calcPIs(population: individual[], fitSum: number): number[] {
    /*let pis:number[] = [];
    for(let ind of population){
      pis.push(ind.fitness/fitSum);
    }*/
    let pis = population.map(ind => {
      return ind.fitness / fitSum;
    });
    //console.log("calcSumPIs: " + pis);
    return pis;
  }

  calcCumulativeProb(probs: number[]): number[] {
    let cis: number[] = [];
    let ci = 0;
    for (let i = 0; i < probs.length; i++) 
    {
      ci += probs[i];
      cis.push(ci);
    }
    //console.log("calcCumulativeProb cis.length: " + cis.length);
    //console.log("calcCumulativeProb last ci: " + cis[cis.length-1]);
    return cis;
  }

  selectByRoulette(generation: individual[]): individual[] {
    let couples: individual[] = [];
    let sumFits: number = this.calcSumFits(generation);
    let pi = this.calcPIs(generation, sumFits);
    let ci = this.calcCumulativeProb(pi);
    while (couples.length < this.numOfNewIndividual()) 
    {
      let randomNumber = Math.random();
      let selectedIndex = 0;
      while (randomNumber > ci[selectedIndex]) 
      {
        selectedIndex++;
      }
      //console.log("selectByRoulette " + "randomNumber[" + randomNumber + "]" + " selectedIndex[" + selectedIndex + "]"+ " ci[" + ci[selectedIndex] + "]");
      couples.push(generation[selectedIndex]);
    }

    return couples;
  }

  selectByTourney(generation: individual[]): individual[] 
  {
    let couples: individual[] = [];

    while (couples.length < this.numOfNewIndividual()) 
    {
      ///select individual by random
      let tourneyIndividuals = [];
      for (let index = 0; index < this.numOfIndividualsInTourney; index++) 
      {
        let randomIndex = Math.floor(Math.random() * this.populationSize);
        //if(teste < 0 && this.numCurrentGeneration < 2) console.log("selectByTourney randomIndex: " +randomIndex);
        tourneyIndividuals.push(generation[randomIndex]);
      }

      ///ordering
      tourneyIndividuals = this.getAscendingFitnessPopulation(tourneyIndividuals);

      ///select the best in the group
      couples.push(this.bestIndividualFromAscendingPop(tourneyIndividuals));
    }

    return couples;
  }

  bestIndividualFromAscendingPop(ascendingPopulation: individual[]) 
  {
    return ascendingPopulation[ascendingPopulation.length - 1];
  }

  bestIndividualsFromAscendingPop(ascendingPopulation: individual[], numOfIndividuals) 
  {
    return ascendingPopulation.slice(ascendingPopulation.length - numOfIndividuals, ascendingPopulation.length);
  }

  selectCouples(generation: individual[]) 
  {
    switch (this.couplesSelectionMode) 
    {
      case "Roleta":
        //console.log("selectCouples roleta");
        return this.selectByRoulette(generation);
        break;
      case "Torneio":
        console.log("selectCouples torneio");
        return this.selectByTourney(generation);
        break;
      default:
        //console.log("selectCouples default");
        return null;
        break;
    }
  }

  applyCrossover(previousGeneration: individual[], nextGeneration: individual[]) 
  {
    //console.log("applyCrossover");
    let couples = this.selectCouples(previousGeneration);

    /// for every group of two individuals try to cross
    for (let index = 0; index < couples.length; index += 2) 
    {
      let couple: individual[] = couples.slice(index, index + 2);
      //console.log("couple");

      if (Math.random() < this.probCruzamento) 
      {
        ///cruza
        //console.log("can crossover");
        let newIndividuals: individual[] = this.crossIndividuals(couple);
        nextGeneration.push(newIndividuals[0]);
        nextGeneration.push(newIndividuals[1]);
        //console.log(nextGeneration);
      } 
      else 
      {
        ///keep with parents
        nextGeneration.push(couple[0]);
        nextGeneration.push(couple[1]);
      }
    }
  }

  crossIndividuals(couple: individual[]): individual[] {
    //console.log("crossIndividuals couple: ");
    //couple.forEach((indiv)=>console.log(indiv.chromosome));
    let newIndividuals: individual[] = [];
    let newChromosome: Variable[] = [];

    ///Math.floor(Math.random()*(this.resolution - 1)) 0 to 8 - +=1 1 to 9
    let indexToCross: number =
      Math.floor(Math.random() * (this.numOfVariables - 1)) + 1; /// 1 to 9 (pos entre os bits)
    //console.log("crossIndividuals indexToCross: " + indexToCross);

    newChromosome = couple[0].chromosome
      .slice(0, indexToCross)
      .concat(couple[1].chromosome.slice(indexToCross, this.numOfVariables));
    let ind1: individual = this.getIndividual(newChromosome);
    newIndividuals.push(ind1);
    //console.log("crossIndividuals ind1: " + ind1.chromosome);

    newChromosome = couple[1].chromosome
      .slice(0, indexToCross)
      .concat(couple[0].chromosome.slice(indexToCross, this.numOfVariables));
    let ind2: individual = this.getIndividual(newChromosome);
    newIndividuals.push(ind2);
    //console.log("crossIndividuals ind2: " + ind2.chromosome);

    return newIndividuals;
  }

  applyMutation(population: individual[]) 
  {
    let mutationApplied = false;
    //console.log("applyMutation");
    for (let j = 0; j < population.length; j++) 
    {
      let indiv = population[j];
      mutationApplied = false;
      for (let varIndex = 0; varIndex < indiv.chromosome.length; varIndex++) 
      {
        if (Math.random() < this.probMutacao) 
        {
          //console.log("mutation in individual " + j + " chromosome " + k);
          mutationApplied = true;
          //console.log("before mutation" + indiv.chromosome[k]);
          ///change data that relies on variable, as machineStart
          this.getRamdomVariable(varIndex);
          //console.log("after mutation" + indiv.chromosome[k]);
        }
      }
      if (mutationApplied) 
      {
        population.splice(j, 1, this.getIndividual(indiv.chromosome));
      }
    }
  }

  ///new chromosome -> select ramdom values to all variables
  getRandomVariables(): Variable[]
  {
    //console.log("getRandomVariables");
    let variables: Variable[] = [];
    for (let index = 0; index < this.numOfVariables; index++) {
      variables.push(this.getRamdomVariable(index));
    }
    //console.log("getRandomVariables ", variables);
    return variables;
  }

  selectIndividual(ci: number[]): number {
    //console.log(ci);
    let randomNumber = Math.random();
    let selectedIndex = 0;
    while (randomNumber > ci[selectedIndex]) 
    {
      selectedIndex++;
    }
    //console.log("selectIndividual " + "randomNumber[" + randomNumber + "]" + " selectedIndex[" + selectedIndex + "]"+ " ci[" + ci[selectedIndex] + "]");
    return selectedIndex;
  }

  selectInitialPopulation(): individual[] {
    let currentGeneration: individual[] = [];
    for (let i = 0; i < this.populationSize; i++) 
    {
      //console.log("selectInitialPopulation: " + i);
      
      currentGeneration.push(  this.getIndividual(this.getRandomVariables())  );
    }

    /*
    let bits = [1,1,1,1,1,1,1,1,1,1]
    this.binArrayToDecimal(bits);
    this.wholeToReal( this.binArrayToDecimal(bits));

    for(let i = 0; i < this.populationSize; i++)
    {
      this.wholeToReal( this.binArrayToDecimal(currentGeneration[i]));
    }
    */
    return currentGeneration;
  }

  getIndividual(chromosome: Variable[]): individual {
    //console.log("getIndividual");
    let indiv: individual = {
      chromosome: this.getRandomVariables(),
      data: {
        pp: [],
        pl: [],
        machines: []
      }
    };

    /// calculate variable outputs
    for (const variable of indiv.chromosome) {
      let machine: Machine = {maintenanceStart: variable.value}
      indiv.data.machines.push( machine );
    }

    indiv.fitness = this.calcFitness(indiv);

    ///getting the best individuals
    this.evaluateIndividual(indiv);
    //console.log("getIndividual", indiv);
    return indiv;
  }

  evaluateIndividual(indiv: individual) 
  {
    let insertedInd;
    //let bestIndFull = this.bestInd.length == this.numOfBestToKeep;
    for (let i = 0; i < this.bestInd.length && i < this.numOfBestToKeep; i++) 
    {
      insertedInd = false;
      if (this.hasIndividual(indiv)) 
      {
        //console.log("Already in the best");
        insertedInd = true;
        return;
      } 
      else if (indiv.fitness > this.bestInd[i].fitness) 
      {
        insertedInd = true;
        //indiv.generation = this.numCurrentGeneration;
        if (this.bestInd.length == this.numOfBestToKeep)
          // if it is full, removes one to insert
          this.bestInd.splice(i, 1, indiv);
        else {
          this.bestInd.splice(i, 0, indiv);
        }
        break;
      }
    }
    if (!insertedInd && this.bestInd.length < this.numOfBestToKeep) 
    {
      /// if it was not inserted and there is space
      insertedInd = true;
      //indiv.generation = this.numCurrentGeneration;
      this.bestInd.push(indiv);
    }

    if (insertedInd) 
    {
      indiv.generation = this.numCurrentGeneration;
      //console.log("bestInd");
      //console.log(this.bestInd);
    }
  }

  hasIndividual(indiv: individual) 
  {
    let containsInd = false;
    this.bestInd.forEach(element => {
      let areAllVarEqual = true;
      for (const iVar in element.chromosome) {
        if(element.chromosome[iVar].value != indiv.chromosome[iVar].value)
        {
          areAllVarEqual = false;
          break;
        }
      }
      if(areAllVarEqual)
      {
        containsInd = true;
        return containsInd;
      }
    });
    return containsInd;
  }

  getRamdomVariable(indexVar: number): Variable
  {
    //console.log("getRamdomVariable indexVar", indexVar);
    let variable: Variable = {
      id: (indexVar + 1).toString()    
    }
    /// it could be done inside a function if every var is a different thing
    let  machine = this.schedulingConfig.machines[indexVar];
    /// se numOfMaintenances (número de intervalos consecutivos de manutenção) é:
    /// numOfMaintenances=2 -> 4-(2-1)=3 
    /// numOfMaintenances=1 -> 4-(1-1)=4 
    let numOfStarts = 4 - (machine.numOfMaintenances - 1);
    
    /// se numOfMaintenances=2, numOfStarts = 3, e retorna um número entre 0 e 2 
    /// que representa uma possível representação binária - 00, 01, 10 
    variable.value = this.getRamdomInt(numOfStarts);
    //console.log("getRamdomVariable variable", variable);
    return variable;
  }

  getRamdomInt(maxExclusive: number)
  {
    return Math.floor(Math.random() * maxExclusive);
  }

  calcFitness(indiv: individual): number 
  {
    let fitness = 0;
    this.calcPPs(indiv);
    this.calcPLs(indiv);

    fitness = this.minArray(indiv.data.pl);
    if(fitness < 0) fitness = 0;

    return fitness;
  }

  calcPPs(indiv: individual){
    for (let index = 0; index < this.numOfIntervals; index++) {
      indiv.data.pp[index] = this.calcPP(index, indiv.data);
    }
  }

  calcPP(intervalIndex: number, data: schedulingData): number
  {
    let pp = 0;
    for (const iMachine in data.machines) {
      /// se o intervalo está entre star e o final = startMa + numOfMaintenances - 1
      const machineConfig = this.schedulingConfig.machines[iMachine];
      const machine = data.machines[iMachine];
      if(intervalIndex >= machine.maintenanceStart && 
        intervalIndex <= this.getMaintenanceEnd(machine.maintenanceStart, machineConfig.numOfMaintenances))
        {
          pp += this.schedulingConfig.machines[iMachine].capacity;
        }
    }
    return pp;
  }

  getMaintenanceEnd(maintenanceStart: number, numOfMaintenances: number)
  {
    return maintenanceStart  + numOfMaintenances  - 1;
  }

  calcPLs(indiv: individual){
    for (let index = 0; index < this.numOfIntervals; index++) {
      indiv.data.pl[index] = this.calcPl(this.schedulingConfig.pt, this.schedulingConfig.pd[index], indiv.data.pp[index]);      
    }
  }

  calcPl(pt:number, pd: number, pp: number)
  {
    return pt - pd - pp;
  }

  functionToAnalise(x: number): number 
  {
    ///trab 02 funcion
    //return - Math.abs(x * Math.sin(Math.sqrt(Math.abs(x)) ));

    ///trab 03 funcion
    ///to graph calculator - x * sin(x^4) + cos(x^2)
    return x * Math.sin(Math.pow(x, 4)) + Math.cos(Math.pow(x, 2));
  }

  binArrayToDecimal(bits: number[]) 
  {
    let decimalValue = 0;
    for (let i = 0; i < bits.length; i++)
      decimalValue += bits[i] * Math.pow(2, i);

    //console.log("binArrayToDecimal: " + decimalValue);
    return decimalValue;
  }

  calcFitnessAverage(generation: individual[]): number {
    let averageFit: number = 0;
    generation.forEach(element => {
      averageFit += element.fitness;
    });
    averageFit /= generation.length;
    return averageFit;
  }
  

  /////////////////////
}

interface individual {
  chromosome?: Variable[];

  data: schedulingData;

  ///indicates how much the the individual is good (generally is f(x)+c)
  fitness?: number;

  ///generation number
  generation?: number;

}

interface Variable{
  ///match with unitId
  id: string;
  //binary?: string;
  value?: number;
}

interface schedulingData{
  //pt: number;
  /// potências perdidas em cada intervalo
  pp: number[];

  /// potências líquidas em cada intervalo
  pl: number[];

  machines: Machine[];
}

interface schedulingConfig{
  pt: number;
  pd: number[];
  machines: MachineConfig[];
}
/*
interface Interval{
  /// potência perdida no intervalo (soma de todas as máquinas em manutenção)
  pp?: number;
  /// potência demanda no intervalo
  pd: number;
}
*/
interface MachineConfig{
  /// identificador de 1 a 7
  unitID: string;

  /// potência da unidade
  capacity: number;

  /// número de intervalos consecutivos de manutenção - duração da manutenção
  numOfMaintenances: number;

  /// the number between 0 and 3, representing one of the four year intervals
  maintenanceStart?: number;

  binary?: string;
}

interface Machine{
  maintenanceStart?: number;

  binary?: string;
}