#!/bin/bash
# auto_test.sh: テストケース作成・テスト実行・CSV出力を自動化

set -e

# 1. テストケースファイルを生成（上書き）
cat << 'EOF' > ./src/testcase.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import TestApp from './testApp.jsx';
import React from 'react';

describe('App コンポーネント', () => {
  test('TestApp を描画する', () => {
    render(<App />);
    expect(screen.getByText('業務用Todo管理アプリ')).toBeInTheDocument();
  });
});

describe('index.js', () => {
  test('Appが正常にレンダリングされる', () => {
    render(<App />);
    expect(screen.getByText('業務用Todo管理アプリ')).toBeInTheDocument();
  });
});

describe('TestApp コンポーネント', () => {
  test('初期表示でタスクがない旨が表示される', () => {
    render(<TestApp />);
    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
  });

  test('タスクを追加できる', () => {
    render(<TestApp />);
    const input = screen.getByPlaceholderText('新しいタスクを入力してください');
    const button = screen.getByText('追加');
    fireEvent.change(input, { target: { value: 'テストタスク' } });
    fireEvent.click(button);
    expect(screen.getByText('テストタスク')).toBeInTheDocument();
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
EOF

# 2. テスト実行＆CSV出力
npx jest src/testcase.test.js --ci --reporters=default --reporters=jest-junit --outputFile=testresult.csv

echo "テスト完了: testresult.csv に出力しました。"
