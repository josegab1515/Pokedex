import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, switchMap, map, Observable } from 'rxjs';
import { PokeApiService } from '../../services/poke-api.service';
import { BtnMoreComponent } from '../btn-more/btn-more.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

interface PokemonCompleto {
  id: number;
  nome: string;
  imagem: string;
  tipos: string[];
  descricao: string;
  stats: { nome: string, valor: number }[];
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
  imports: [CommonModule, BtnMoreComponent, HeaderComponent, FooterComponent],
  standalone: true
})
export class HomeComponent implements OnInit {

  listaPokemons: PokemonCompleto[] = [];

  private apiUrlImage = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

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
              const stats = info.stats.map((s: any) => ({
                nome: s.stat.name,
                valor: s.base_stat
              }));

            
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
                  descricao,
                  stats
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

  getCorTipo(tipo: string): string {
    const coresPorTipo: { [key: string]: string } = {
      fire: '#F08030',
      water: '#6890F0',
      grass: '#78C850',
      electric: '#F8D030',
      psychic: '#F85888',
      normal: '#A8A878',
      poison: '#A040A0',
      bug: '#A8B820',
      flying: '#A890F0',
      ground: '#E0C068',
      rock: '#B8A038',
      ice: '#98D8D8',
      fighting: '#C03028',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC'
    };
    const tipoNormalizado = tipo.toLowerCase();
    return coresPorTipo[tipoNormalizado] || '#A8A8A8';
  }

  getCorTipoTipo(tipo: string): string {
    const coresPorTipo: { [key: string]: string } = {
      fire: '#FF5733',
      water: '#1E90FF',
      grass: '#4CAF50',
      electric: '#FFEB3B',
      psychic: '#D500F9',
      normal: '#BDBDBD',
      poison: '#8E24AA',
      bug: '#8BC34A',
      flying: '#03A9F4',
      ground: '#F4B400',
      rock: '#8D6E63',
      ice: '#00BCD4',
      fighting: '#D32F2F',
      ghost: '#673AB7',
      dragon: '#9C27B0',
      dark: '#616161',
      steel: '#607D8B',
      fairy: '#EC6A97'
    };
  
    const tipoNormalizado = tipo.toLowerCase();
    return coresPorTipo[tipoNormalizado] || '#F2CCC3'; 
  }

  quantidadeExibida: number = 15;
  carregarMais() {
    this.quantidadeExibida += 10;
  }
  
  toggleFocus(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;

    const allCards = document.querySelectorAll('.pokemon-card');
    allCards.forEach((item: Element) => {
        const cardElement = item as HTMLElement; 
        if (cardElement !== card) {
            cardElement.classList.remove('focused');
        }
    });

    if (card.classList.contains('focused')) {
        card.classList.remove('focused');
    } else {
        card.classList.add('focused');
        setTimeout(() => {
            card.classList.remove('focused');
        }, 10000); 
    }
  }
  
}

