/**
 * 数据导出工具：支持导出为 Excel（.xls）与 PDF（打印另存）。
 * 纯前端实现，无需后端服务。
 */

// 导出为 Excel（HTML 表格格式的 .xls，Excel/WPS 均可打开）
export function exportToExcel(
  headers: string[],
  rows: (string | number)[][],
  filename: string,
): void {
  const escape = (v: string | number) =>
    String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const thead = `<tr>${headers.map(h => `<th>${escape(h)}</th>`).join('')}</tr>`;
  const tbody = rows
    .map(r => `<tr>${r.map(c => `<td>${escape(c)}</td>`).join('')}</tr>`)
    .join('');
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table border="1">${thead}${tbody}</table></body></html>`;

  const blob = new Blob(['\﻿' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 导出为 PDF：复制目标元素内容与样式到新窗口并触发打印（用户可选「另存为 PDF」）
export function exportToPDF(element: HTMLElement, title: string, filename: string): void {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return;

  // 收集当前页面样式表，保证打印结果与页面一致
  const styleText = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        return Array.from(sheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n');
      } catch {
        return '';
      }
    })
    .join('\n');

  printWindow.document.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>` +
      `<style>${styleText}\n@page{size:A4;margin:12mm;}body{background:#fff;padding:16px;}</style>` +
      `</head><body>${element.innerHTML}</body></html>`,
  );
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 600);
}