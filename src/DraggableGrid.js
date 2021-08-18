import React, { Component, useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { TweenLite } from "gsap";
import { Draggable } from "gsap/Draggable";
import "./styles.css";

gsap.registerPlugin(Draggable);

function onInvalidatedBoard() {
  const boards = document.querySelectorAll(".board");
  // even if a board's tiles were animated already, this will take place after that, not interfering
  for (let i = 0; i < boards.length; i++) {
    const board = boards[i];
    let oldBoardTiles = board.querySelectorAll(".draggable");
    const oldBoardWidth = board.clientWidth;

    let totalTileWidth = 0;

    const tileGutterSize = Number(board.dataset.gutterSize);
    const tileMoveTime = Number(board.dataset.tileMoveTime);
    const boardLength = board.clientWidth;
    let xpadding = 0;
    for (let i = 0; i < oldBoardTiles.length; i++) {
      let tileWidth = Number(board.dataset.tileSize);
      oldBoardTiles[i].style.width = `${tileWidth}px`;
      oldBoardTiles[i].style.height = `${tileWidth}px`;

      oldBoardTiles[i].style.backgroundSize = `${tileWidth}px`;

      totalTileWidth = tileGutterSize * 2 + tileWidth;
      let xpadding_add =
        oldBoardWidth -
        (((i * totalTileWidth + xpadding) % oldBoardWidth) % oldBoardWidth);
      xpadding += xpadding_add >= totalTileWidth ? 0 : xpadding_add;
      const xCoord =
        ((i * totalTileWidth + xpadding) % oldBoardWidth) / totalTileWidth;

      console.log(xpadding);

      const yCoord = Math.floor(
        (i * totalTileWidth + xpadding) / oldBoardWidth
      );

      TweenLite.to(oldBoardTiles[i], tileMoveTime, {
        x: tileGutterSize + xCoord * tileGutterSize * 2 + xCoord * tileWidth,
        y: tileGutterSize + yCoord * tileGutterSize * 2 + yCoord * tileWidth,
      });
    }

    TweenLite.to(board, tileMoveTime, {
      height:
        Math.floor(
          ((oldBoardTiles.length - 1) * totalTileWidth + xpadding) / boardLength
        ) *
          totalTileWidth +
        totalTileWidth,
    });
  }
}

function DraggableTileGrid(props) {
  const boardRef = React.useRef();

  React.useEffect(() => {
    if (props.gutterSize) {
      boardRef.current.dataset.gutterSize = props.gutterSize;
    } else if (props.gutterFraction && props.tileFraction) {
      boardRef.current.dataset.gutterSize =
        props.boardWidth * props.tileFraction * props.gutterFraction;
    }

    onInvalidatedBoard();
  }, [boardRef, props.gutterSize, props.tileFraction, props.gutterFraction]);

  React.useEffect(() => {
    if (props.tileSize) {
      boardRef.current.dataset.tileSize = props.tileSize;
    } else if (props.gutterFraction && props.tileFraction) {
      boardRef.current.dataset.tileSize =
        props.boardWidth * props.tileFraction * (1 - 2 * props.gutterFraction);
    }
    onInvalidatedBoard();
  }, [boardRef, props.tileSize, props.tileFraction, props.gutterFraction]);

  React.useEffect(() => {
    boardRef.current.dataset.boardHeight = props.boardHeight;
    onInvalidatedBoard();
  }, [boardRef, props.boardHeight]);

  React.useEffect(() => {
    boardRef.current.dataset.boardWidth = props.boardWidth;
    onInvalidatedBoard();
  }, [boardRef, props.boardWidth]);

  React.useEffect(() => {
    boardRef.current.dataset.tileMoveTime = props.tileMoveTime;
    onInvalidatedBoard();
  }, [boardRef, props.tileMoveTime]);

  return (
    <div
      id={props.id}
      className="board"
      ref={boardRef}
      style={{
        // margin: 10,
        borderStyle: "solid",
        borderWidth: 0,
        borderColor: "black",
        width: props.boardWidth,
        minHeight: props.boardHeight,
        backgroundColor: props.backgroundColor
          ? props.backgroundColor
          : "black",
        // make sure no tile is covered by it
        zIndex: -1,
      }}
    />
  );
}

function populateGrid(amount, gridElementId) {
  for (let i = 0; i < amount; i++) {
    const newTile = document.createElement("div");
    newTile.className = "tile draggable";
    newTile.style.backgroundImage =
      "url(https://i.postimg.cc/QNnNjNvn/istockphoto-1211868209-612x612.jpg)";
    newTile.style.backgroundRepeat = "no-repeat";
    const gridElement = document.getElementById(gridElementId);
    newTile.style.width = `${Number(gridElement.dataset.tileSize)}px`;
    newTile.style.backgroundSize = newTile.style.width;
    newTile.style.height = `${Number(gridElement.dataset.tileSize)}px`;
    gridElement.appendChild(newTile);
  }

  Draggable.create(`  .draggable`, {
    onPress: () => console.log("Pressed Draggable"),
    onDrag: onDrag,
    onRelease: onRelease,
    bounds: window,
    // I want this tile to rise above the others while being dragged
    zIndexBoost: true,
  });

  onInvalidatedBoard();
}

function clearGrid(gridElementId) {
  const gridElement = document.getElementById(gridElementId);
  const tiles = gridElement.querySelectorAll(".draggable");
  for (let i = 0; i < tiles.length; i++) {
    tiles[i].remove();
  }
  const tileMoveTime = Number(gridElement.dataset.tileMoveTime);
  TweenLite.to(gridElement, tileMoveTime, {
    height: 0,
  });
}

const onDrag = function () {};
// function to call on release event for each tile
const onRelease = function () {
  let boards = document.querySelectorAll(".board");
  let targetBoard = null;
  for (let i = 0; i < boards.length; i++) {
    if (this.hitTest(boards[i], "50%")) {
      targetBoard = boards[i];
      break;
    }
  }
  const sourceBoard = this.target.parentElement;
  if (targetBoard && targetBoard !== sourceBoard) {
    const oldBoardRect = sourceBoard.getBoundingClientRect();

    let numberBoardTiles = targetBoard.querySelectorAll(".draggable").length;
    targetBoard.appendChild(this.target);

    const newBoardRect = targetBoard.getBoundingClientRect();

    const blockProp = gsap.getProperty(this.target);
    const blockX = blockProp("x");
    const blockY = blockProp("y");
    const blockWidth = blockProp("width");
    const tileMoveTime = Number(targetBoard.dataset.tileMoveTime);

    const newBoardLength = targetBoard.clientWidth;

    // this.disable();

    TweenLite.fromTo(
      this.target,
      tileMoveTime,
      {
        x: blockX + oldBoardRect.x - newBoardRect.x,
        y: blockY + oldBoardRect.y - newBoardRect.y,
      },
      {
        x: (numberBoardTiles * blockWidth) % newBoardLength,
        y:
          Math.floor((numberBoardTiles * blockWidth) / newBoardLength) *
          blockWidth,
        // onComplete: this.enable(),
      }
    );
    TweenLite.to(targetBoard, tileMoveTime, {
      height:
        Math.floor((numberBoardTiles * blockWidth) / newBoardLength) *
          blockWidth +
        blockWidth,
    });
  }
  onInvalidatedBoard();
};

export { DraggableTileGrid, populateGrid, clearGrid };
