const crypto = require("crypto");
const readline = require("readline");

class Game {
  constructor(moves) {
    this.moves = moves;
    this.halfMoves = (moves.length - 1) / 2;
    this.key = crypto.randomBytes(32);
    this.computerMove = moves[Math.floor(Math.random() * moves.length)];
    this.hmac = crypto
      .createHmac("sha3-256", this.key)
      .update(this.computerMove)
      .digest("hex");
  }

  printHmac() {
    console.log(`HMAC: ${this.hmac}`);
  }

  printMoves() {
    console.log("Available moves:");
    this.moves.forEach((move, index) => {
      console.log(`${index + 1} - ${move}`);
    });
    console.log("0 - exit");
    console.log("? - help");
  }

  printHelp() {
    const cellWidth = Math.max(...this.moves.map((move) => move.length)) + 2;
    const separator = "+".padEnd(cellWidth + 58, "-") + "+";
    console.log("Help:");
    console.log(separator);
    console.log(
      `|${["PC Moves", ...this.moves]
        .map((move) => move.padStart(cellWidth))
        .join("|")}|`
    );
    console.log(separator);
    this.moves.forEach((move1, index1) => {
      const row = [move1];
      this.moves.forEach((move2, index2) => {
        if (index1 === index2) {
          row.push("Draw");
        } else if (
          (index2 > index1 && index2 <= index1 + this.halfMoves) ||
          (index2 < index1 && index2 < index1 - this.halfMoves)
        ) {
          row.push("Win");
        } else {
          row.push("Lose");
        }
      });
      console.log(`|${row.map((cell) => cell.padStart(cellWidth)).join("|")}|`);
      console.log(separator);
    });
  }

  play(userMoveIndex) {
    const userMove = this.moves[userMoveIndex];
    console.log(`Your move: ${userMove}`);
    console.log(`Computer move: ${this.computerMove}`);

    const computerMoveIndex = this.moves.indexOf(this.computerMove);
    if (userMoveIndex === computerMoveIndex) {
      console.log("Draw!");
    } else if (
      (computerMoveIndex > userMoveIndex &&
        computerMoveIndex <= userMoveIndex + this.halfMoves) ||
      (computerMoveIndex < userMoveIndex &&
        computerMoveIndex < userMoveIndex - this.halfMoves)
    ) {
      console.log("You win!");
    } else {
      console.log("You lose!");
    }

    console.log(`HMAC key: ${this.key.toString("hex")}`);
  }
}

class Validator {
  static validateArgs(args) {
    if (args.length < 3 || args.length % 2 === 0) {
      console.log(
        "Error: Incorrect number of arguments. Must be an odd number >= 3."
      );
      console.log("Example: node game.js rock paper scissors lizard Spock");
      process.exit(1);
    }

    if (new Set(args).size !== args.length) {
      console.log("Error: Arguments must be non-repeating.");
      console.log("Example: node game.js rock paper scissors lizard Spock");
      process.exit(1);
    }
  }

  static validateMove(move, moves) {
    const userMoveIndex = parseInt(move, 10) - 1;
    if (
      isNaN(userMoveIndex) ||
      userMoveIndex < 0 ||
      userMoveIndex >= moves.length
    ) {
      console.log("Error: Invalid move.");
      process.exit(1);
    }
    return userMoveIndex;
  }
}

class Menu {
  constructor(game) {
    this.game = game;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  start() {
    this.game.printHmac();
    this.promptMove();
  }

  promptMove() {
    this.game.printMoves();
    this.rl.question("Enter your move: ", (answer) => {
      if (answer === "0") {
        console.log("Exiting...");
        process.exit(0);
      }

      if (answer === "?") {
        this.game.printHelp();
        this.promptMove();
        return;
      }

      const userMoveIndex = parseInt(answer, 10) - 1;
      if (
        isNaN(userMoveIndex) ||
        userMoveIndex < 0 ||
        userMoveIndex >= this.game.moves.length
      ) {
        console.log("Error: Invalid move.");
        this.promptMove();
        return;
      }

      this.game.play(userMoveIndex);
      process.exit(0);
    });
  }
}

const args = process.argv.slice(2);
Validator.validateArgs(args);

const game = new Game(args);
const menu = new Menu(game);
menu.start();
