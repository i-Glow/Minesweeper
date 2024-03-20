const canvas = document.querySelector(".canvas");
const remainingMines = document.querySelector("#mines");
const UI_timer = document.querySelector("#timer");
const difficulty = document.querySelectorAll(".difficulty");
const root = document.querySelector(":root");
const again = document.querySelector("#play-again");

again.addEventListener("click", () => {
  location.reload();
});

let canvasWidth, canvasHeight;
let squareWidth = 40,
  squareHeight = 40;

let level;
let MINE_COUNT, COLUMN_COUNT, ROW_COUNT;
let revealedCount = 0;
let mineList = new Set();
let squareList;
let gameOver = true;

difficulty.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    if (!revealedCount) timer();
    document.querySelector(".game-menu").style.display = "none";
    document.querySelector(".wrapper").style.display = "block";
    start = true;
    switch (i) {
      case 0:
        MINE_COUNT = 10;
        COLUMN_COUNT = 10;
        ROW_COUNT = 10;
        canvasWidth = canvasHeight = 400;
        level = "easy";
        break;
      case 1:
        MINE_COUNT = 40;
        COLUMN_COUNT = 16;
        ROW_COUNT = 16;
        canvasWidth = canvasHeight = 640;
        level = "intermediate";
        break;
      case 2:
        MINE_COUNT = 99;
        COLUMN_COUNT = 30;
        ROW_COUNT = 16;
        canvasWidth = COLUMN_COUNT * squareWidth;
        canvasHeight = ROW_COUNT * squareHeight;
        level = "expert";
        break;
    }
    //start the game
    root.style.setProperty("--width", canvasWidth + "px");
    root.style.setProperty("--height", canvasHeight + "px");
    initialize();
    squareList = document.querySelectorAll(".square");
    canvas.addEventListener("click", clickHandler);
  });
});

//
let timeInterval = undefined;

function timer() {
  let time = 0;

  timeInterval = setInterval(() => {
    time += 1;

    UI_timer.innerText = new Date(time * 1000 + 1000)
      .toUTCString()
      .match(/(\d\d:\d\d:\d\d)/)[0];

    if (revealedCount >= COLUMN_COUNT * ROW_COUNT - MINE_COUNT) {
      // stop the counter
      clearInterval(timeInterval);

      // get best scores
      let best = window.localStorage.getItem("Best Time") || null;
      best = JSON.parse(best);

      let score = {
        easy: {
          time: best?.easy.time || "00:00:00",
          value: best?.easy.value || 0,
        },
        intermediate: {
          time: best?.intermediate.time || "00:00:00",
          value: best?.intermediate.value || 0,
        },
        expert: {
          time: best?.expert.time || "00:00:00",
          value: best?.expert.value || 0,
        },
      };

      // update scores
      if (
        level === "easy" &&
        (timer < best?.easy.value || best?.easy.value === 0 || !best)
      ) {
        score.easy.value = time;
        score.easy.time = UI_timer.innerText;
      }
      if (
        level === "intermediate" &&
        (timer < best?.intermediate.value || best?.intermediate.value === 0)
      ) {
        score.intermediate.value = timer;
        score.intermediate.time = UI_timer.innerText;
      }
      if (
        level === "expert" &&
        (timer < best?.expert.value || best?.expert.value === 0)
      ) {
        score.expert.value = timer;
        score.expert.time = UI_timer.innerText;
      }

      // save new scores
      score = JSON.stringify(score);
      window.localStorage.setItem("Best Time", score);

      // display score
      alert(
        `Finished in: ${
          UI_timer.innerText
        }\nBest score: ${window.localStorage.getItem("Best Time")}`
      );
    }
  }, 1000);
}

//board initialization
function initialize() {
  gameOver = false;
  for (let i = 1; i <= COLUMN_COUNT * ROW_COUNT; i++) {
    let square = document.createElement("div");
    square.style.width = canvasWidth / COLUMN_COUNT + "px";
    square.style.height = canvasHeight / ROW_COUNT + "px";

    square.id = i;
    square.classList.add("square");

    canvas.appendChild(square);
  }
  remainingMines.innerText = MINE_COUNT;
}

function checkPos(id) {
  let array = new Array();
  if (id > COLUMN_COUNT) {
    id % COLUMN_COUNT !== 1 ? array.push(true) : array.push(false);

    //Top
    array.push(true);

    //Top right
    id % COLUMN_COUNT !== 0 ? array.push(true) : array.push(false);
  } else array.push(false, false, false);

  // left
  id % COLUMN_COUNT !== 1 ? array.push(true) : array.push(false);

  id % COLUMN_COUNT !== 0 ? array.push(true) : array.push(false);

  //bottom
  if (id <= (ROW_COUNT - 1) * COLUMN_COUNT) {
    id % COLUMN_COUNT !== 1 ? array.push(true) : array.push(false);

    array.push(true);

    id % COLUMN_COUNT !== 0 ? array.push(true) : array.push(false);
  } else array.push(false, false, false);

  return array;
}

function surroundings(target) {
  return (surr = [
    target - COLUMN_COUNT - 1,
    target - COLUMN_COUNT,
    target - COLUMN_COUNT + 1,
    target - 1,
    target + 1,
    target + COLUMN_COUNT - 1,
    target + COLUMN_COUNT,
    target + COLUMN_COUNT + 1,
  ]);
}

function randomMines(target) {
  while (mineList.size < MINE_COUNT) {
    const mine = Math.floor(Math.random() * COLUMN_COUNT * ROW_COUNT) + 1;

    if (!surroundings(Number(target)).includes(mine) && Number(target) !== mine)
      mineList.add(mine);
  }
}

function addMines() {
  squareList.forEach((square, i) => {
    if (mineList.has(i + 1)) {
      square.classList.add("mine");
    }
  });
}

function countSurroundings(id, idx = id - 1) {
  let count = 0;
  if (id > COLUMN_COUNT) {
    //Top left
    if (id % COLUMN_COUNT !== 1)
      if (squareList[idx - COLUMN_COUNT - 1].classList.contains("mine"))
        count++;

    //Top
    if (squareList[idx - COLUMN_COUNT].classList.contains("mine")) count++;

    //Top right
    if (id % COLUMN_COUNT !== 0)
      if (squareList[idx - COLUMN_COUNT + 1].classList.contains("mine"))
        count++;
  }

  // left
  if (id % COLUMN_COUNT !== 1)
    if (squareList[idx - 1].classList.contains("mine")) count++;

  if (id % COLUMN_COUNT !== 0)
    if (squareList[idx + 1].classList.contains("mine")) count++;

  //bottom
  if (id <= (ROW_COUNT - 1) * COLUMN_COUNT) {
    if (id % COLUMN_COUNT !== 1)
      if (squareList[idx + COLUMN_COUNT - 1].classList.contains("mine"))
        count++;

    if (squareList[idx + COLUMN_COUNT].classList.contains("mine")) count++;

    if (id % COLUMN_COUNT !== 0) {
      if (squareList[idx + COLUMN_COUNT + 1].classList.contains("mine"))
        count++;
    }
  }

  return count;
}

function squareValue() {
  addMines();
  squareList.forEach((square) => {
    square.value = countSurroundings(Number(square.id));
  });
}

//first click
function clickHandler(e) {
  UI_timer.innerText = 0;
  e.target.innerText = 0;
  e.target.revealed = true;
  e.target.style.backgroundColor = "#fffdd0";
  revealedCount++;
  randomMines(e.target.id);

  squareValue();
  surroundings(Number(e.target.id)).forEach((surr, idx) => {
    if (checkPos(Number(e.target.id))[idx]) reveal(squareList[surr - 1]);
  });
  click();
  canvas.removeEventListener("click", clickHandler);
}

//sd
function reveal(square) {
  if (square.style.backgroundColor === "blue") remainingMines.innerText++;
  square.style.backgroundColor = "#fffdd0";
  square.innerText = square.value;
  if (!square.revealed) revealedCount++;
  square.revealed = true;
  if (Number(square.value) === 0) {
    surroundings(Number(square.id)).forEach((surr, idx) => {
      if (checkPos(Number(square.id))[idx] && !squareList[surr - 1].revealed)
        reveal(squareList[surr - 1]);
    });
  }
}

function revealMines() {
  mineList.forEach((mine) => {
    squareList[mine - 1].style.backgroundColor = "red";
    squareList[
      mine - 1
    ].innerHTML = `<img src='assets/mine.png' width='12px' />`;
  });
  clearInterval(timeInterval);
}

function click() {
  if(gameOver) return;
  
  squareList.forEach((square) => {
    square.addEventListener("mousedown", (e) => {
      e.preventDefault();
      if (e.which === 1) {
        if (square.classList.contains("mine")) {
          square.style.backgroundColor = "red";
          revealMines();
          gameOver = true;
        } else if (square.revealed) {
          surroundings(Number(square.id)).forEach((surr) => {
            reveal(squareList[surr - 1]);
          });
        } else reveal(square);
      } else if (e.which === 3 && !square.revealed) {
        if (square.style.backgroundColor === "blue") {
          square.style.backgroundColor = "#666";
          square.innerHTML = "";
          remainingMines.innerText++;
        } else {
          square.style.backgroundColor = "blue";
          square.innerHTML = `<img src='assets/flag.png' width='12px' />`;
          remainingMines.innerText--;
        }
      }
    });
  });
}
