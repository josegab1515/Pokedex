import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, switchMap, map, Observable } from 'rxjs';
import { PokeApiService } from '../../services/poke-api.service';

interface PokemonCompleto {
  id: number;
  nome: string;
  imagem: string;
  tipos: string[];
  descricao: string;
}

interface PokemonBase {
  id: number;
  nome: string;
}

interface TipoData {
  names: { language: { name: string }, name: string }[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class HomeComponent implements OnInit {

  listaPokemons: PokemonCompleto[] = [];
  private apiUrlImage = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

  constructor(private pokeApiService: PokeApiService) {}

  ngOnInit(): void {
    this.getPokemons();
  }

  getPokemons(): void {
    this.pokeApiService.getPokemon().pipe(
      switchMap(response => {
        const listaBase: PokemonBase[] = response.results.map((pokemon: any, index: number) => ({
          nome: pokemon.name,
          id: index + 1
        }));

        const requisicoes = listaBase.map((poke: PokemonBase) =>
          forkJoin({
            info: this.pokeApiService.getPokemonById(poke.id),
            especie: this.pokeApiService.getPokemonSpeciesById(poke.id)
          }).pipe(
            switchMap(({ info, especie }) => {
              const tiposObservables: Observable<string>[] = info.types.map((tipoInfo: any) =>
                this.pokeApiService.getTipo(tipoInfo.type.name).pipe(
                  map((tipoData: TipoData) => {
                    const nomePt = tipoData.names.find((n: any) => n.language.name === 'pt')?.name;
                    return nomePt || tipoInfo.type.name;
                  })
                )
              );

            
              const descricaoEntry = especie.flavor_text_entries.find(
                (entry: any) => entry.language.name === 'en' 
              );

              const descricao = descricaoEntry?.flavor_text.replace(/\f/g, ' ') || 'Descrição não encontrada';

              return forkJoin(tiposObservables).pipe(
                map((tiposTraduzidos: string[]) => ({
                  id: poke.id,
                  nome: poke.nome,
                  imagem: `${this.apiUrlImage}/${poke.id}.png`,
                  tipos: tiposTraduzidos,
                  descricao
                }))
              );
            })
          )
        );

        return forkJoin(requisicoes);
      })
    ).subscribe({
      next: (listaFinal: PokemonCompleto[]) => {
        this.listaPokemons = listaFinal;
      },
      error: (err) => {
        console.error('Erro ao carregar Pokémons:', err);
      }
    });
  }

  capitalizeFirstLetter(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
