import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';

import { environment } from '../environments/environment';

import { AngularFireModule } from '@angular/fire/compat';

import { AngularFireAuthModule } from '@angular/fire/compat/auth';

import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

import { CoreModule } from './core/core.module';

import { QuillModule } from 'ngx-quill';
import { ProfileComponent } from './features/profile/profile/profile.component';
import { FormsModule } from '@angular/forms';

@NgModule({

  declarations: [
    AppComponent,
    ProfileComponent
  ],

  imports: [

    FormsModule,

    BrowserModule,

    BrowserAnimationsModule,

    AppRoutingModule,

    CoreModule,

    AngularFireModule.initializeApp(
      environment.firebaseConfig
    ),

    AngularFireAuthModule,

    AngularFirestoreModule,

    QuillModule.forRoot({

      modules: {

        toolbar: [

          ['bold', 'italic', 'underline', 'strike'],

          [{ header: 1 }, { header: 2 }],

          [{ list: 'ordered' }, { list: 'bullet' }],

          [{ script: 'sub' }, { script: 'super' }],

          [{ indent: '-1' }, { indent: '+1' }],

          [{ direction: 'rtl' }],

          [{ size: ['small', false, 'large', 'huge'] }],

          [{ header: [1, 2, 3, 4, 5, 6, false] }],

          [{ color: [] }, { background: [] }],

          [{ align: [] }],

          ['blockquote', 'code-block'],

          ['link', 'image'],

          ['clean']
        ]
      }
    })
  ],

  providers: [],

  bootstrap: [AppComponent]
})

export class AppModule {}