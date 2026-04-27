import test from "node:test";
import assert from "node:assert/strict";

import { createInitialState, placeFood, setDirection, stepGame } from "../src/game.js";

test("snake moves one cell in its current direction", () => {
  const state = createInitialState({
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ],
    food: { x: 5, y: 5 },
  });

  const nextState = stepGame(state);

  assert.deepEqual(nextState.snake, [
    { x: 3, y: 2 },
    { x: 2, y: 2 },
    { x: 1, y: 2 },
  ]);
  assert.equal(nextState.score, 0);
});

test("snake grows and score increases when food is eaten", () => {
  const state = createInitialState({
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ],
    food: { x: 3, y: 2 },
  });

  const nextState = stepGame(state, () => 0);

  assert.deepEqual(nextState.snake, [
    { x: 3, y: 2 },
    { x: 2, y: 2 },
    { x: 1, y: 2 },
    { x: 0, y: 2 },
  ]);
  assert.equal(nextState.score, 1);
  assert.notDeepEqual(nextState.food, { x: 3, y: 2 });
});

test("opposite direction turns are ignored", () => {
  const state = createInitialState();
  const nextState = setDirection(state, "left");

  assert.equal(nextState.nextDirection, "right");
});

test("wall collisions end the game", () => {
  const state = createInitialState({
    snake: [
      { x: 15, y: 5 },
      { x: 14, y: 5 },
      { x: 13, y: 5 },
    ],
    food: { x: 0, y: 0 },
  });

  const nextState = stepGame(state);

  assert.equal(nextState.isGameOver, true);
});

test("body collisions end the game", () => {
  const state = createInitialState({
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    direction: "up",
    food: { x: 0, y: 0 },
  });

  const nextState = stepGame(setDirection(state, "left"));

  assert.equal(nextState.isGameOver, true);
});

test("food placement skips occupied cells", () => {
  const food = placeFood(
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ],
    2,
    () => 0,
  );

  assert.deepEqual(food, { x: 1, y: 1 });
});
