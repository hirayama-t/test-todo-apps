import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import TestApp from './testApp.jsx';
import React from 'react';

// App.js のテスト

describe('App コンポーネント', () => {
  test('TestApp を描画する', () => {
    render(<App />);
    expect(screen.getByText('業務用Todo管理アプリ')).toBeInTheDocument();
  });
});

// index.js のテスト
// index.jsはDOMへのマウントや副作用のみなので、Smokeテストのみ

describe('index.js', () => {
  test('Appが正常にレンダリングされる', () => {
    // AppのSmokeテストで代用
    render(<App />);
    expect(screen.getByText('業務用Todo管理アプリ')).toBeInTheDocument();
  });
});

// testApp.jsx のテスト

describe('TestApp コンポーネント', () => {
  test('初期表示でタスクがない旨が表示される', () => {
    render(<TestApp />);
    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
  });

  test('タスクを追加できる', () => {
    render(<TestApp />);
    const input = screen.getByPlaceholderText('新しいタスクを入力してください');
    const dateInput = screen.getByPlaceholderText('期日');
    const prioritySelect = screen.getByDisplayValue('中');
    const button = screen.getByText('追加');
    fireEvent.change(input, { target: { value: 'テストタスク' } });
    fireEvent.change(dateInput, { target: { value: '2025-12-31' } });
    fireEvent.change(prioritySelect, { target: { value: '高' } });
    fireEvent.click(button);
    expect(screen.getByText('テストタスク')).toBeInTheDocument();
    expect(screen.getByText('期日: 2025-12-31')).toBeInTheDocument();
    expect(screen.getByText('優先度: 高')).toBeInTheDocument();
  });
  test('タスクの重要フラグを切り替えられる', () => {
    render(<TestApp />);
    const input = screen.getByPlaceholderText('新しいタスクを入力してください');
    const button = screen.getByText('追加');
    fireEvent.change(input, { target: { value: '重要タスク' } });
    fireEvent.click(button);
    const flagBtn = screen.getByText('重要');
    // 重要フラグON
    fireEvent.click(flagBtn);
    expect(screen.getByTitle('重要')).toBeInTheDocument();
    // 重要フラグOFF
    fireEvent.click(flagBtn);
    expect(screen.queryByTitle('重要')).not.toBeInTheDocument();
  });

  test('空欄で追加しようとするとアラートが出る', () => {
    window.alert = jest.fn();
    render(<TestApp />);
    const button = screen.getByText('追加');
    fireEvent.click(button);
    expect(window.alert).toHaveBeenCalledWith('タスク内容を入力してください。');
  });

  test('タスクを完了にできる', () => {
    render(<TestApp />);
    const input = screen.getByPlaceholderText('新しいタスクを入力してください');
    const button = screen.getByText('追加');
    fireEvent.change(input, { target: { value: '完了タスク' } });
    fireEvent.click(button);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    const label = screen.getByText('完了タスク');
    expect(label.parentElement.className).toMatch(/completed/);
  });

  test('タスクを削除できる', () => {
    render(<TestApp />);
    const input = screen.getByPlaceholderText('新しいタスクを入力してください');
    const button = screen.getByText('追加');
    fireEvent.change(input, { target: { value: '削除タスク' } });
    fireEvent.click(button);
    const deleteBtn = screen.getByText('削除');
    fireEvent.click(deleteBtn);
    expect(screen.queryByText('削除タスク')).not.toBeInTheDocument();
  });

  test('フィルタボタンで未完了・完了を切り替えられる', () => {
    render(<TestApp />);
    const input = screen.getByPlaceholderText('新しいタスクを入力してください');
    const button = screen.getByText('追加');
    // 未完了タスク
    fireEvent.change(input, { target: { value: '未完了タスク' } });
    fireEvent.click(button);
    // 完了タスク
    fireEvent.change(input, { target: { value: '完了タスク' } });
    fireEvent.click(button);
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // 2つ目を完了
    // 未完了フィルタ
    fireEvent.click(screen.getByText('未完了'));
    expect(screen.getByText('未完了タスク')).toBeInTheDocument();
    expect(screen.queryByText('完了タスク')).not.toBeInTheDocument();
    // 完了フィルタ
    fireEvent.click(screen.getByText('完了'));
    expect(screen.getByText('完了タスク')).toBeInTheDocument();
    expect(screen.queryByText('未完了タスク')).not.toBeInTheDocument();
    // 全てフィルタ
    fireEvent.click(screen.getByText('全て'));
    expect(screen.getByText('未完了タスク')).toBeInTheDocument();
    expect(screen.getByText('完了タスク')).toBeInTheDocument();
  });

  test('件数表示が正しい', () => {
    render(<TestApp />);
    const input = screen.getByPlaceholderText('新しいタスクを入力してください');
    const button = screen.getByText('追加');
    fireEvent.change(input, { target: { value: 'A' } });
    fireEvent.click(button);
    fireEvent.change(input, { target: { value: 'B' } });
    fireEvent.click(button);
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // 1つ目を完了
    expect(screen.getByText('全て: 2件')).toBeInTheDocument();
    expect(screen.getByText('未完了: 1件')).toBeInTheDocument();
    expect(screen.getByText('完了: 1件')).toBeInTheDocument();
  });
});
