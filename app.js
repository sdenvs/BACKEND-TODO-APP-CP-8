const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

let db = null;
const dbPath = path.join(__dirname, "todoApplication.db");

app.use(express.json());

const initialization = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("server Started");
    });
  } catch (e) {
    console.log(`error: ${e}`);
  }
};

initialization();

const isStatusAndpriority = (status, priority) => {
  return status !== undefined && priority !== undefined;
};

const isStatus = (status) => {
  return status !== undefined;
};

const isPriority = (priority) => {
  return priority !== undefined;
};

//API-1 get all todo's
app.get("/todos/", async (req, res) => {
  const { status, priority, search_q = "" } = req.query;
  console.log(status, priority, search_q);

  switch (true) {
    case isStatusAndpriority(status, priority):
      let statusAndPriorityQuery = `SELECT *
    FROM 
        todo
    WHERE 
        status = '${status}'
        AND priority = '${priority}'
        AND todo LIKE "%${search_q}%";`;
      const getArrayForStatusAndPriority = await db.all(statusAndPriorityQuery);
      res.send(getArrayForStatusAndPriority);
      break;
    case isStatus(status):
      let statusQuery = `SELECT *
    FROM 
        todo
    WHERE 
        status = '${status}'
        AND todo LIKE "%${search_q}%";`;
      const getAForStatus = await db.all(statusQuery);
      res.send(getAForStatus);
      break;
    case isPriority(priority):
      let priorityQuery = `SELECT *
    FROM 
        todo
    WHERE 
        priority = '${priority}'
        AND todo LIKE "%${search_q}%";`;
      const getArrayForPriority = await db.all(priorityQuery);
      res.send(getArrayForPriority);
      break;
    default:
      let query = `SELECT *
    FROM 
        todo
    WHERE 
        todo LIKE "%${search_q}%";`;
      const getArray = await db.all(query);
      res.send(getArray);
      break;
  }
});

//API-2 get todo by id
app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const query = `SELECT *
        FROM 
            todo 
        WHERE 
            id = ${todoId};`;
  const getArray = await db.get(query);
  res.send(getArray);
});

app.post("/todos/", async (req, res) => {
  const { id, todo, priority, status } = req.body;
  console.log(id, todo, priority, status);
  const query = `INSERT INTO todo
        (id, todo, priority, status) 
        VALUES
        (${id}, '${todo}', '${priority}', '${status}');`;

  await db.run(query);
  res.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (req, res) => {
  const { status, todo, priority } = req.body;
  const { todoId } = req.params;
  console.log(status, todo, priority);
  if (status !== undefined) {
    const statusQuery = `UPDATE todo
      SET
      status = '${status}';`;
    await db.run(statusQuery);
    res.send("Status Updated");
  }
  if (priority !== undefined) {
    const priorityQuery = `UPDATE todo
      SET
      priority = '${priority}';`;
    await db.run(priorityQuery);
    res.send("Priority Updated");
  }
  if (todo !== undefined) {
    const todoQuery = `UPDATE todo
      SET 
      todo = '${todo}';`;
    await db.run(todoQuery);
    res.send("Todo Updated");
  }
});

//API-5
app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const query = `DELETE 
    FROM todo 
    WHERE 
        id = ${todoId};`;
  await db.run(query);
  res.send("Todo Deleted");
});

module.exports = app;
