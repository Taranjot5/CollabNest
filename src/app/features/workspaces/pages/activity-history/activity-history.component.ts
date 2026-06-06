import {
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute
} from '@angular/router';

import {
  ActivityService
} from '../../services/activity.service';

import {
  Activity
} from '../../models/activity.model';

@Component({
  selector:
    'app-activity-history',

  templateUrl:
    './activity-history.component.html',

  styleUrls:
    ['./activity-history.component.scss']
})

export class ActivityHistoryComponent
implements OnInit {

  activities: Activity[] = [];

  workspaceId = '';

  constructor(

    private route:
    ActivatedRoute,

    private activityService:
    ActivityService
  ) {}

  ngOnInit(): void {

    this.workspaceId =

      this.route.snapshot
      .params['id'];

    this.activityService
      .getActivities(
        this.workspaceId
      )
      .subscribe(data => {

        this.activities =
          data;
      });
  }
}