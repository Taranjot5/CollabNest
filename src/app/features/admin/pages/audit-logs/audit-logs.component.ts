import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subject } from 'rxjs';

import { takeUntil } from 'rxjs/operators';

import {
  AuditLogEntry,
  AuditLogService
} from '../../../../core/services/audit-log.service';

@Component({
  selector: 'app-audit-logs',
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.scss']
})
export class AuditLogsComponent implements OnInit, OnDestroy {

  logs: AuditLogEntry[] = [];

  filteredLogs: AuditLogEntry[] = [];

  loading = true;

  searchText = '';

  actionFilter = 'all';

  private destroy$ = new Subject<void>();

  constructor(private auditLog: AuditLogService) {}

  ngOnInit(): void {

    this.auditLog.getLogs(200).pipe(
      takeUntil(this.destroy$)
    ).subscribe(logs => {
      this.logs = logs;
      this.applyFilters();
      this.loading = false;
    });
  }

  applyFilters(): void {

    let result = [...this.logs];

    if (this.actionFilter !== 'all') {
      result = result.filter(l => l.action.startsWith(this.actionFilter));
    }

    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase();
      result = result.filter(l =>
        l.message.toLowerCase().includes(q)
        || l.actorName.toLowerCase().includes(q)
        || l.action.toLowerCase().includes(q)
      );
    }

    this.filteredLogs = result;
  }

  formatAction(action: string): string {
    return action.replace(/\./g, ' › ').replace(/_/g, ' ');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
