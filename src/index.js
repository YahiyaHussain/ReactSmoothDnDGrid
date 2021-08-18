import React, { Component, useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { gsap } from "gsap";
import { TweenLite } from "gsap";
import { Draggable } from "gsap/Draggable";
import "./styles.css";
import Slider from "@material-ui/core/Slider";
import { Typography } from "@material-ui/core";
import { DraggableTileGrid, populateGrid, clearGrid } from "./DraggableGrid";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

gsap.registerPlugin(Draggable);

const TILE_MOVE_TIME = 0.5;
const TILE_SIZE = "90px";
const TILE_BORDER_COLOR = "white";
const TILE_GUTTER_SIZE = 5;
const TILE_AMOUNT = 10;

const DEFAULT_TILE_STYLE = {
  backgroundColor: "lavender",
  position: "absolute",
  height: TILE_SIZE,
  width: TILE_SIZE,
  boxSizing: "border-box",
  borderWidth: 5,
  margin: 0,
  borderStyle: "solid",
  borderColor: TILE_BORDER_COLOR,
};

function onInvalidatedBoard() {
  const boards = document.querySelectorAll(".board");
  for (let i = 0; i < boards.length; i++) {
    const board = boards[i];
    let oldBoardTiles = board.querySelectorAll(".draggable");
    const oldBoardWidth = board.clientWidth;

    let totalTileWidth = 0;
    const boardLength = board.clientWidth;
    for (let i = 0; i < oldBoardTiles.length; i++) {
      const blockProp = gsap.getProperty(oldBoardTiles[i]);
      let blockX = blockProp("x");
      let blockY = blockProp("y");
      let blockWidth = blockProp("width");

      totalTileWidth = TILE_GUTTER_SIZE * 2 + blockWidth;
      const xCoord = ((i * totalTileWidth) % oldBoardWidth) / totalTileWidth;
      const yCoord = Math.floor((i * totalTileWidth) / oldBoardWidth);

      TweenLite.to(oldBoardTiles[i], TILE_MOVE_TIME, {
        x:
          TILE_GUTTER_SIZE +
          xCoord * TILE_GUTTER_SIZE * 2 +
          xCoord * blockWidth,
        y:
          TILE_GUTTER_SIZE +
          yCoord * TILE_GUTTER_SIZE * 2 +
          yCoord * blockWidth,
      });
    }
    TweenLite.to(board, TILE_MOVE_TIME, {
      height:
        Math.floor(
          ((oldBoardTiles.length - 1) * totalTileWidth) / boardLength
        ) *
          totalTileWidth +
        totalTileWidth,
    });
  }
}

const App = () => {
  // save a reference to the board component in render jsx

  const [boardWidth, setBoardWidth] = React.useState(300);
  const [boardHeight, setBoardHeight] = React.useState(200);

  const [tileFraction, setTileFraction] = React.useState(0.25);
  const [gutterFraction, setGutterFraction] = React.useState(0.1);

  return (
    <div style={{ marginLeft: 0 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => populateGrid(TILE_AMOUNT, "primary_board_id")}
      >
        Populate Grid
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={() => clearGrid("primary_board_id")}
      >
        Clear Grid
      </Button>
      <Typography>Height</Typography>
      <Slider
        min={0}
        max={1000}
        defaultValue={200}
        valueLabelDisplay="on"
        step={1}
        value={boardHeight}
        onChange={(event, newValue) => {
          setBoardHeight(newValue);
        }}
      ></Slider>
      <Typography>Width</Typography>
      <Slider
        min={0}
        max={1000}
        defaultValue={300}
        valueLabelDisplay="on"
        step={1}
        value={boardWidth}
        onChange={(event, newValue) => {
          setBoardWidth(newValue);
        }}
      ></Slider>
      <Typography>Tile Fraction</Typography>
      <Slider
        min={0}
        max={1}
        defaultValue={0.25}
        step={0.01}
        valueLabelDisplay="on"
        value={tileFraction}
        onChange={(event, newValue) => {
          setTileFraction(newValue);
        }}
      ></Slider>
      <Typography>Gutter Size</Typography>
      <Slider
        min={0}
        max={1}
        step={0.01}
        defaultValue={0.1}
        valueLabelDisplay="on"
        value={gutterFraction}
        onChange={(event, newValue) => {
          setGutterFraction(newValue);
        }}
      ></Slider>

      <Grid container spacing={3} direction={"row"}>
        <Grid item>
          <DraggableTileGrid
            tileMoveTime={TILE_MOVE_TIME}
            boardWidth={boardWidth}
            boardHeight={boardHeight}
            id={"primary_board_id"}
            // gutterSize={gutterSize}
            // tileSize={tileSize}
            gutterFraction={gutterFraction}
            tileFraction={tileFraction}
          />
        </Grid>
        <Grid item>
          <DraggableTileGrid
            tileMoveTime={TILE_MOVE_TIME}
            boardWidth={boardWidth}
            boardHeight={boardHeight}
            id={"secondary_board_id"}
            // gutterSize={gutterSize}
            // tileSize={tileSize}
            gutterFraction={gutterFraction}
            tileFraction={tileFraction}
          />
        </Grid>
      </Grid>
    </div>
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
