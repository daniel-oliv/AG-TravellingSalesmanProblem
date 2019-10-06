import { Component, OnInit, ɵConsole } from "@angular/core";

const EQUATORIAL_RADIUS = 6378;

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
  mutationMode: string;
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

  //numOfIntervals: number;
  numOfVariables: number;
  destinations: Variable[];
  mapLineData: marker[];

  constructor() {}

  ngOnInit() 
  {
    console.log("ngOnInit");

    this.probCruzamento = 0.6;
    this.probMutacao = 0.01;
    this.populationSize = 70;
    this.maxNumOfGenerations = 50;
    this.bestInd = [];
    this.numOfBestToKeep = 5;
    this.numCurrentGeneration = 0;
    this.generations = [];
    this.isGraphResponsive = true;
    this.showGraph1 = 'block';
    this.showGraph2 = 'none';
    this.couplesSelectionMode = "Roleta";
    this.mutationMode = "Gene";
    this.checkBoxSelectedItens = ["elitism"];
    this.numOfIndividualsInTourney = 4;
    this.numOfElitismInd = 2;

  }

  newSightseeing(destinations: marker[])
  {
    console.log("newSightseeing");
    this.destinations = [];
    for (const markObj of destinations) 
    {
      this.destinations.push(
        {
          id: markObj.label,
          data: markObj
        });
    }

    //console.log("destinations ", destinations);
    //console.log("this ", this.destinations);
    this.numOfVariables = destinations.length;
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

    /*
    for (let i = 0; i < this.generations.length; i++) 
    {
      setTimeout(() => {
        //this.drawFunction(this.generationsDataSets.slice(i, i + 1));
      }, i * 2);
    }
    */
    this.plotPerformanceGraph(this.generations);
    this.mapLineData = this.getBestIndLineData();
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

  crossIndividuals(couple: individual[]): individual[] 
  {
    //console.log("crossIndividuals couple: ", couple);
    let newIndividuals: individual[] = this.applyPMXCrossover(couple);
    //console.log("crossIndividuals ind2: " + ind2.chromosome);

    return newIndividuals;
  }

  //partially matched crossover
  applyPMXCrossover(couple: individual[]): individual[]
  {
    let newIndividuals: individual[] = [];
    let newChromosome: Variable[] = [];
    let indexesToCross: number[] = [];

    ///Math.floor(Math.random()*(this.resolution - 1)) 0 to 8 - +=1 1 to 9
    indexesToCross.push( this.getRandomCrossPosition() );
    indexesToCross.push( this.getRandomCrossPosition() );
    indexesToCross = this.getAscendingArray(indexesToCross);
    //console.log("applyPMXCrossover indexesToCross: ", indexesToCross);

    let blockFrom1 = couple[0].chromosome.slice(indexesToCross[0], indexesToCross[1]);
    let blockFrom2 = couple[1].chromosome.slice(indexesToCross[0], indexesToCross[1]);

    newChromosome = this.mountPMXCromosome(indexesToCross[0], indexesToCross[1], 
      couple[0].chromosome, blockFrom2, blockFrom1);
    let ind1: individual = this.getIndividual(newChromosome);
    newIndividuals.push(ind1);
    //console.log("crossIndividuals ind1: " + ind1.chromosome);

    newChromosome = this.mountPMXCromosome(indexesToCross[0], indexesToCross[1], 
      couple[1].chromosome, blockFrom1, blockFrom2);
    let ind2: individual = this.getIndividual(newChromosome);
    newIndividuals.push(ind2);
    //console.log("crossIndividuals ind2: " + ind2.chromosome);

    return newIndividuals;
  }

  getRandomCrossPosition(): number
  {
    return Math.floor(Math.random() * (this.numOfVariables - 1)) + 1;/// 1 to 9 (pos entre os bits)
  }

  getAscendingArray(array: number[]): number[]
  {
    let ordered: number[]= [];
    ordered.push(array[0]);
    ///starting at 1, since we had already added 0th
    for (let i = 1; i < array.length; i++) 
    {
      let insertedIndividual = false;
      for (let j = 0; j < ordered.length; j++) 
      {
        ///if the fitness is less than some already inserted individual's fitness, insert it before
        if (array[i] < ordered[j]) 
        {
          ordered.splice(j, 0, array[i]);
          insertedIndividual = true;
          break;
        }
      }
      /// if it was not inserted, push it at the end, since it is the biggest value
      if (insertedIndividual === false) 
      {
        ordered.push(array[i]);
      }
    }
    /*console.log("getAscendingFitnessPopulation");
    console.log("first");
    console.log(ordered[0]);
    console.log("last");
    console.log(ordered[ordered.length - 1]);*/
    return ordered;
  }

  /// the indexToCross1 must be less than indexToCross2
  mountPMXCromosome(indexToCross1: number, indexToCross2: number, 
    baseChromosome: Variable[], newFixedBlock: Variable[], oldblock: Variable[]): Variable[]
  {
    //console.log("baseChromosome", baseChromosome);

    //let newChromosome = baseChromosome.concat();
    //newChromosome.splice(indexToCross1, indexToCross2 - indexToCross1, ...newFixedBlock);
    
    let newChromosome = [];

    for (let index = 0; index < baseChromosome.length; index++) 
    {
      /// it is not inside the new fixed part - indexToCross2 is a end not included
      if(index < indexToCross1 || index > indexToCross2 -1)
      {
        newChromosome.push( this.getNoRepeatedGene(baseChromosome[index], newFixedBlock, oldblock) );
      }
      else
      {
        newChromosome.push(newFixedBlock[index - indexToCross1]);
      }
    }

    // console.log("oldblock", oldblock);
    // console.log("newFixedBlock", newFixedBlock);
    // console.log("newChromosome", newChromosome);
    // console.log("baseChromosome", baseChromosome);
    return newChromosome;
  }

  getNoRepeatedGene(gene: Variable, fixedBlock: Variable[], replacedBlock: Variable[]): Variable
  {
    //let getIndexOfLocation = 
    //if( this.hasLocationID(fixedBlock, gene) )
    if( fixedBlock.includes(gene) )    
    {
      //console.log("fixedBlock.indexOf(gene)", fixedBlock.indexOf(gene));
      return this.getNoRepeatedGene(replacedBlock[fixedBlock.indexOf(gene)], fixedBlock, replacedBlock);
    }
    return gene;
  }

  
  hasLocationID(chromosomeBlock: Variable[], geneToTest: Variable): boolean
  {
      for (const iGene of chromosomeBlock)
      {
        if(iGene.id == geneToTest.id)
        {
          console.log("hasLocationID true");
          return true;
        }
      }

      return false;
  }
  
  applyMutation(population: individual[]) 
  {
    let newChromosome;
    let mutationApplied = false;
    //console.log("applyMutation");
    for (let j = 0; j < population.length; j++) 
    {
      let indiv = population[j];
      newChromosome = indiv.chromosome.concat();;
      switch (this.mutationMode) 
      {
        case "Gene":
          //console.log("applyMutation Gene");
          mutationApplied = this.tryMutationInGenes(newChromosome);
          break;
        case "Individuo":
          //console.log("applyMutation tryOneMutation");
          mutationApplied = this.tryOneMutation(newChromosome);
          break;
        default:
          //console.log("applyMutation default");
          return null;
          break;
      }

      if (mutationApplied) 
      {
        population.splice(j, 1, this.getIndividual(newChromosome));
      } 
    }
  }

  tryMutationInGenes(newChromosome: Variable[]): boolean
  {
    let mutationApplied = false;
    for (let varIndex = 0; varIndex < newChromosome.length; varIndex++) 
      {
        if (Math.random() < this.probMutacao) 
        {
          //console.log("mutation in individual " + j + " chromosome " + k);
          mutationApplied = true;
          //console.log("before mutation" + indiv.chromosome[k]);
          this.swapMutation(varIndex, newChromosome);
          //console.log("after mutation" + indiv.chromosome[k]);
        }
      }
      return mutationApplied;
  }

  tryOneMutation(chromosome: Variable[]): boolean
  {
    if (Math.random() < this.probMutacao)
    {
      let index1 = Math.floor(Math.random() * chromosome.length);
      this.swapMutation(index1, chromosome);
      return true;
    }
    return false;
  }

  swapMutation(indexToSwap: number, chromosome: Variable[])
  {
    let index2 = Math.floor(Math.random() * chromosome.length);
    let gene1 = chromosome[indexToSwap];
    let gene2 = chromosome[index2];
    chromosome[indexToSwap] = gene2;
    chromosome[index2] = gene1;
  }

  getRandomTour() : Variable[]
  {
    let chromosome: Variable[] = [];
    //console.time();    
    let remainderDests = this.destinations.concat();
    //console.timeEnd();
    let ramdomNum;
    while(remainderDests.length > 0)
    {
      ramdomNum = Math.floor(Math.random() * remainderDests.length);
      //console.log("ramdomNum ", ramdomNum);
      let selectedDest = remainderDests[ramdomNum];
      //console.log("selectedDest", selectedDest);
      chromosome.push(selectedDest);

      remainderDests.splice(ramdomNum, 1);
    }
    return chromosome;
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

  selectInitialPopulation(): individual[] 
  {
    let currentGeneration: individual[] = [];

    for (let i = 0; i < this.populationSize; i++) 
    {
      //console.log("selectInitialPopulation: " + i);
      currentGeneration.push(  this.getIndividual(this.getRandomTour())  );
    }
    return currentGeneration;
  }

  getIndividual(chromosome: Variable[]): individual {
    //console.log("getIndividual");
    let indiv: individual = {
      chromosome: chromosome,
    };

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
        ///////
        if(element.chromosome[iVar].id != indiv.chromosome[iVar].id)
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

  getRamdomInt(maxExclusive: number)
  {
    return Math.floor(Math.random() * maxExclusive);
  }

  calcFitness(indiv: individual): number 
  {
    let fitness = 0;
    indiv.totalDistance = this.getTotalDistance(indiv);
    fitness = EQUATORIAL_RADIUS - indiv.totalDistance;
    //console.log("fitness", fitness)
    if(fitness < 0) 
    {
      console.log("SO BIG DISTANCE! MORE THAN EARTH RADIUS!");
      fitness = 0;
    }
    return fitness;
  }

  getTotalDistance(indiv: individual): number
  {
    //console.log(indiv.chromosome);
    let totalDistance = 0;
    ///it does not includes the distance between the last and the firts city;
    for (let index = 0; index < indiv.chromosome.length - 1; index++) 
    {
      totalDistance += this.asTheCrowFlies(
        indiv.chromosome[index].data.lat, indiv.chromosome[index].data.lng,
        indiv.chromosome[index+1].data.lat, indiv.chromosome[index+1].data.lng
      );
    }
    ///for the way between the last and the firts location
    totalDistance += this.asTheCrowFlies(
      indiv.chromosome[indiv.chromosome.length - 1].data.lat, indiv.chromosome[indiv.chromosome.length - 1].data.lng,
      indiv.chromosome[0].data.lat, indiv.chromosome[0].data.lng
    );
    //console.log("------------------------ totalDistance ", totalDistance);
    return totalDistance;
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

  /// distância em linha reta em km
  asTheCrowFlies(ltDeg1: number, lgDeg1: number, latDeg2: number, lgDeg2: number) 
  {
    let distance = 0;
    const RADIANS: number = 180 / 3.14159265;
    const METRES_IN_MILE: number = 1609.34;
    
    if (ltDeg1 == latDeg2 && lgDeg1 == lgDeg2) 
    {
      distance = 0;
    
    } 
    else 
    {
      // Calculating Distance between Points
      let lt1 = ltDeg1 / RADIANS;
      let lg1 = lgDeg1 / RADIANS;
      let lt2 = latDeg2 / RADIANS;
      let lg2 = lgDeg2 / RADIANS;
    
      // radius of earth in miles (3,958.8) * metres in a mile * position on surface of sphere...
      distance = (3958.8 / 1000 * METRES_IN_MILE) * Math.acos(Math.sin(lt1) * Math.sin(lt2) + Math.cos(lt1) * Math.cos(lt2) * Math.cos(lg2 - lg1));
    }
    //console.log("distance", distance);
    if(distance < 0)
    {
      console.log("NEGATIVE DISTANCE")
    }
    //console.log("distance ", distance);
    return distance; 
  }
  
  getBestIndLineData()
  {
    let lineData: marker[] = [];
    let bestChromosome = this.bestInd[0].chromosome.concat();

    for (const location of bestChromosome) 
    {
      lineData.push(location.data);
    }
    /// for drawing the line between the firts and the last
    lineData.push(bestChromosome[0].data)
    //console.log("lineData", lineData);
    return lineData;
  }
  
  /////////////////////
}

interface individual {
  /// indicates the order to visit the cities, that is, the tour
  chromosome?: Variable[];

  ///totalDistance summing the distances between all places in the chromosome, including between the last and the first
  totalDistance?: number;

  ///indicates how much the the individual is good (generally is f(x)+c)
  fitness?: number;

  ///generation number
  generation?: number;

}

interface Variable{
  ///match with mark label
  id: string;
  data?: marker;
}
 
declare interface marker {
	lat: number;
	lng: number;
	label?: string;
	draggable: boolean;
}