import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { Hero, Publisher } from '../../interfaces/hero.interface';
import { HeroesService } from '../../services/heroes.service';
import { filter, pipe, switchMap, tap } from 'rxjs';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styles: ``
})
export class NewPageComponent implements OnInit {

  public heroForm = new FormGroup({
    id: new FormControl<string>(''),
    superhero: new FormControl<string>('', { nonNullable: true }),
    publisher: new FormControl<Publisher>(Publisher.DCComics),
    alter_ego: new FormControl(''),
    first_appearance: new FormControl(''),
    characters: new FormControl(''),
    alt_img: new FormControl(''),
  });

  public publishers = [
    { id: 'DC Comics', desc: 'DC - Comics' },
    { id: 'Marvel Comics', desc: 'Marvel - Comics' },
  ];

  constructor(
    private heroservice: HeroesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackbar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  get currentHero(): Hero {
    const hero = this.heroForm.value as Hero;
    return hero;
  }

  ngOnInit(): void {
    if (!this.router.url.includes('edit')) return;
    this.activatedRoute.params
      .pipe(
        switchMap(({ id }) => this.heroservice.getHeroById(id)),
      ).subscribe(hero => {
        if (!hero) return this.router.navigateByUrl('/');
        this.heroForm.reset(hero);
        return;
      });

  }

  onSubmit(): void {
    if (this.heroForm.invalid) return;
    if (this.currentHero.id) {
      this.heroservice.updateHero(this.currentHero)
        .subscribe(hero => {
          this.showSnackbar(`${hero.superhero} updated!`);
          // TODO mostrar snackbars
        });
      return;
    }
    this.heroservice.addHero(this.currentHero)
      .subscribe(hero => {
        this.showSnackbar(`${hero.superhero} created!`);
        // TODO mostrar snackbar y navegar a /heroes/edit/ hero.id
        this.router.navigate(['heroes/edit/', hero.id]);
      })
  }

  onDeleteHero(): void {
    if (!this.currentHero.id) throw Error("Hero id is required");
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: this.heroForm.value,
    });

    dialogRef.afterClosed()
      .pipe(
        filter((result: boolean) => result === true),
        switchMap(() => this.heroservice.deleteHeroByID(this.currentHero.id)),
        filter((wasDelete: boolean) => wasDelete)
      )
      .subscribe(() => {
        this.router.navigate(['heroes']);
      });
  }

  showSnackbar(message: string): void {
    this.snackbar.open(message, 'done', {
      duration: 2500
    });
  }

}
