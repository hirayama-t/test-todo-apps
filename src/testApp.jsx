
import React, { useState } from "react";
import styles from "./testApp.module.css";

// Bootstrap CDNをindex.htmlで読み込んでいる前提

function TestApp() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("中");
  const [filter, setFilter] = useState("all");

  function handleAddTask(e) {
    e.preventDefault();
    if (!validateTaskInput(input)) {
      alert("タスク内容を入力してください。");
      return;
    }
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        text: input.trim(),
        completed: false,
        dueDate: dueDate,
        priority: priority,
        important: false,
      },
    ]);
    setInput("");
    setDueDate("");
    setPriority("中");
  }

  function handleToggleComplete(id) {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  function handleToggleImportant(id) {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, important: !task.important } : task
      )
    );
  }

  function handleDeleteTask(id) {
    setTasks(tasks.filter((task) => task.id !== id));
  }

  function handleFilterChange(newFilter) {
    setFilter(newFilter);
  }

  function getFilteredTasks() {
    if (filter === "active") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  }

  // --- バリデーションチェック関数（シンプルな実装） ---
  function validateTaskInput(value) {
    return typeof value === "string" && value.trim().length > 0;
  }
// --- ここまで ---


  const filteredTasks = getFilteredTasks();
  const totalCount = tasks.length;
  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  // バージョン情報を追加する
  const version = "1.0.0";

  return (
    <div className={styles["todo-container"] + " shadow"}>
      <div className={styles["todo-header"]}>
        <h2 className="mb-0">業務用Todo管理アプリ</h2>
        {/* バージョン表示を追加する */}
        <span className={styles["version"]}>v{version}</span>
      </div>
      <form onSubmit={handleAddTask} className={styles["todo-form"] + " mb-3"}>
        <input
          type="text"
          className="form-control"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="新しいタスクを入力してください"
        />
        <input
          type="date"
          className="form-control"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{ minWidth: 120 }}
          placeholder="期日"
        />
        <select
          className="form-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{ minWidth: 90 }}
        >
          <option value="高">高</option>
          <option value="中">中</option>
          <option value="低">低</option>
        </select>
        <button type="submit" className="btn btn-primary">
          追加
        </button>
      </form>
      <div className={styles["count-info"]}>
        <span>全て: {totalCount}件</span>
        <span>未完了: {activeCount}件</span>
        <span>完了: {completedCount}件</span>
      </div>
      <div className={styles["filter-btns"]}>
        <button
          className={
            "btn btn-sm " +
            (filter === "all" ? "btn-info text-white" : "btn-outline-info")
          }
          onClick={() => handleFilterChange("all")}
        >
          全て
        </button>
        <button
          className={
            "btn btn-sm " +
            (filter === "active" ? "btn-info text-white" : "btn-outline-info")
          }
          onClick={() => handleFilterChange("active")}
        >
          未完了
        </button>
        <button
          className={
            "btn btn-sm " +
            (filter === "completed" ? "btn-info text-white" : "btn-outline-info")
          }
          onClick={() => handleFilterChange("completed")}
        >
          完了
        </button>
      </div>
      <ul className={styles["todo-list"] + " mt-2"}>
        {filteredTasks.length === 0 && (
          <li className="text-muted">タスクがありません</li>
        )}
        {filteredTasks.map((task) => (
          <li key={task.id} className={task.completed ? "completed" : ""}>
            <div className="d-flex align-items-center flex-grow-1" style={{ gap: 8 }}>
              <input
                type="checkbox"
                className="form-check-input"
                checked={task.completed}
                onChange={() => handleToggleComplete(task.id)}
                id={"task-" + task.id}
                style={{ marginRight: 8 }}
              />
              <label
                htmlFor={"task-" + task.id}
                className={task.completed ? styles.completed : ""}
                style={{ cursor: "pointer", flex: 1 }}
              >
                <span>{task.text}</span>
                {task.important && (
                  <span title="重要" style={{ color: '#e53935', marginLeft: 8, fontWeight: 'bold' }}>★</span>
                )}
              </label>
              <button
                className={"btn btn-warning btn-sm ms-2" + (task.important ? " active" : "")}
                onClick={() => handleToggleImportant(task.id)}
                title="重要フラグ切替"
              >
                重要
              </button>
              <span className="badge bg-secondary ms-2">期日: {task.dueDate || '未設定'}</span>
              <span className={"badge ms-2 " + (task.priority === '高' ? 'bg-danger' : task.priority === '中' ? 'bg-info text-dark' : 'bg-light text-dark')}>
                優先度: {task.priority}
              </span>
            </div>
            <button
              className="btn btn-danger btn-sm ms-2"
              onClick={() => handleDeleteTask(task.id)}
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TestApp;
