class Tracker {
  constructor() {
    this.table = document.querySelector(".table-main");
    this.addButton = document.querySelector(".submit");
    this.submitAllBtn = document.querySelector(".submit-all");
    this.processInput = document.querySelector("#process");
    this.explosionInput = document.querySelector("#explosion");
    this.quantom = document.querySelector(".quantom");
    this.entryInput = document.querySelector("#entry");
    this.popup = document.querySelector(".popup");
    this.allInputs = document.querySelectorAll(".main-input");
    this.burstValue = [];
    this.arrivalValue = [];
    this.processValue = [];
    this.gantQueue = [];
    this.gantComp = [];
  }

  //if all the 3 input fields are empty then it wont print anything on the table and will not save the values
  filledFormCheck() {
    if (
      (this.entryInput.value &&
        this.explosionInput.value &&
        this.processInput.value) != ""
    ) {
      return true;
    } else return false;
  }
  addToTable() {
    //check if all the input fields are filled
    if (this.filledFormCheck(true)) {
      //removing no item popup if button is pressed
      this.popup.remove();
      //creating td
      this.allInputs.forEach((element) => {
        element.style.border = "none";
      });
      const tableTr = document.createElement("tr");
      tableTr.innerHTML = `
          <td>${this.processInput.value}</td>
          <td>${this.explosionInput.value}</td>
          <td>${this.entryInput.value}</td>
      `;
      this.table.appendChild(tableTr);
    }
    //if all 3 input fields arent filled (visual change)
    else {
      this.popup.innerText = "please fill out all the inputs";
      this.popup.style.backgroundColor = "#eb5c68";
      this.popup.style.color = "white";
      this.allInputs.forEach((element) => {
        if (element.value == "") element.style.border = "2px solid #eb5c68";
      });
    }
  }
  quantomFunc() {
    //locking input fields from inserting new values
    this.allInputs.forEach((element) => {
      element.disabled = true;
    });
    //displaying saved
    const miniTitle = document.querySelector(".mini-title");
    miniTitle.classList.add("saved");
    miniTitle.innerText = "Saved! cant change the values any more!";
    //preventing user from pressing the button twice
    this.submitAllBtn.disabled = true;
  }
  saveValue() {
    //if all 3 input fields are filled then save the values
    if (this.filledFormCheck(true)) {
      //adding the user values to our array
      //parseInt() function is a predefined function for converting a string to integer
      this.burstValue.push(parseInt(this.explosionInput.value));
      this.arrivalValue.push(parseInt(this.entryInput.value));
      this.processValue.push(this.processInput.value);
      //for deleting input field and starting fresh
      this.processInput.value = "";
      this.entryInput.value = "";
      this.explosionInput.value = "";
    }
  }
  //---------------------------
  //implemeting a FIFO queue
  add(process, completion) {
    //gantQueue holds processes string and gantComp holds (gantt timeline)
    this.gantQueue.push(process);
    this.gantComp.push(parseInt(completion));
  }

  //displaying the queue in the console
  printQueue() {
    console.log("process", this.gantQueue);
    console.log("timeline", this.gantComp);
  }
  //----------------------------

  displayError() {
    let k = 0;
    let cloneArray = [...this.arrivalValue];
    cloneArray.sort(function (a, b) {
      return a - b;
    });
    console.log(this.arrivalValue);
    console.log(cloneArray);
    for (k = 0; k < this.arrivalValue.length; k++) {
      if (this.arrivalValue[k] != cloneArray[k]) {
        const errorModal = document.querySelector(".modal-error");
        errorModal.style.display = "grid";
        break;
      }
    }
  }

  roundRobin() {
    let j = 1,
      found,
      foundIndex,
      mainIndex,
      r,
      test,
      quantomValue = parseInt(this.quantom.value);
    let min, minIndex;
    //clone this.burstValue array
    let burstValueCopy = [...this.burstValue],
      arrivalValueCopy = [...this.arrivalValue];
    this.gantComp = [arrivalValueCopy[0]];

    while (true) {
      //if theres a 0 burst delete the element from all the arrival, process and burst arrays
      burstValueCopy.forEach((element) => {
        if (element == 0) {
          mainIndex = burstValueCopy.indexOf(element);
          burstValueCopy.splice(mainIndex, 1);
          this.processValue.splice(mainIndex, 1);
          arrivalValueCopy.splice(mainIndex, 1);
        }
      });
      //if all burst values have turned into 0 it means the program should stop
      if (burstValueCopy.length == 0) break;
      min = Math.min(...arrivalValueCopy);
      minIndex = arrivalValueCopy.indexOf(min);
      if (quantomValue <= burstValueCopy[minIndex]) {
        this.add(
          this.processValue[minIndex],
          quantomValue + this.gantComp[j - 1]
        );
        arrivalValueCopy[minIndex] = this.gantComp[j];
        burstValueCopy[minIndex] -= quantomValue;
        if (burstValueCopy[minIndex] < 0) burstValueCopy[minIndex] = 0;
        j++;
      } else {
        this.add(
          this.processValue[minIndex],
          burstValueCopy[minIndex] + this.gantComp[j - 1]
        );
        arrivalValueCopy[minIndex] = 0;
        burstValueCopy[minIndex] = 0;
        j++;
      }
    }
  }
  //calculating average waiting time
  avgCalc() {
    let i,
      sum = 0,
      found,
      mainIndex,
      processCalc,
      avg;
    //cloning array so we dont change the original array later
    const clonedArray = [...this.gantQueue],
      clonedNums = [...this.gantComp];
    //reversing array
    clonedArray.reverse();
    clonedNums.reverse();
    for (i = 0; i < this.burstValue.length; i++) {
      //finding the index of the last process
      mainIndex = clonedArray.indexOf(`p${i + 1}`);
      processCalc =
        clonedNums[mainIndex] - this.burstValue[i] - this.arrivalValue[i];
      sum += processCalc;
    }
    avg = sum / this.burstValue.length;
    const mainAverage = document.querySelector(".avg-num");
    mainAverage.innerText = avg;
  }
  printGant() {
    let list = document.getElementById("gantt-chart"),
      list2 = document.getElementById("gantt-time-line");

    this.gantQueue.forEach((item) => {
      let li = document.createElement("li");
      li.innerText = item;
      list.appendChild(li);
    });
    this.gantComp.forEach((item) => {
      let li = document.createElement("li");
      li.innerText = item;
      list2.appendChild(li);
    });
  }
}
//------------------------------------------------
const tracker = new Tracker();
//aninimating gantt chart
function animation() {
  const tl = gsap.timeline({});
  tl.to(".anim-overlay", {
    x: "100%",
    transformOrigin: "left",
    ease: "power2.out",
    duration: 2,
  });
}
function textAnimation() {
  var textWrapper = document.querySelector(".ml9 .letters");
  textWrapper.innerHTML = textWrapper.textContent.replace(
    /\S/g,
    "<span class='letter'>$&</span>"
  );

  anime
    .timeline({ loop: true })
    .add({
      targets: ".ml9 .letter",
      scale: [0, 1],
      duration: 1500,
      elasticity: 600,
      delay: (el, i) => 45 * (i + 1),
    })
    .add({
      targets: ".ml9",
      opacity: 0,
      duration: 1000,
      easing: "easeOutExpo",
      delay: 1000,
    });
}
//making the guide modal------------------
const guideBtn = document.querySelector(".guide"),
  modalGuide = document.querySelector(".modal-guide"),
  videoGuide = document.querySelector(".video-guide"),
  closeModal = document.querySelector(".close-modal");

function guideAdd() {
  modalGuide.classList.add("active");
  videoGuide.play();
}
function guideRemove() {
  modalGuide.classList.remove("active");
}
//---------------------
//initialazing the animation function
textAnimation();
//event Listeners
tracker.addButton.addEventListener("click", () => {
  tracker.addToTable();
});
tracker.addButton.addEventListener("click", () => {
  tracker.saveValue();
});
//for opening and closing guide modal
guideBtn.addEventListener("click", guideAdd);
closeModal.addEventListener("click", guideRemove);

tracker.submitAllBtn.addEventListener("click", () => {
  tracker.quantomFunc();
  tracker.roundRobin();
  tracker.displayError();
  animation();
  tracker.printGant();
  tracker.avgCalc();
});
