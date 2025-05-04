import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PokeApiService {

  private apiUrl = 'https://pokeapi.co/api/v2';

  constructor(private http: HttpClient) {}

  getPokemon() {
    return this.http.get<any>(`${this.apiUrl}/pokemon?limit=151`);
  }

  getPokemonById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/pokemon/${id}`);
  }

  getPokemonSpeciesById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/pokemon-species/${id}`);
  }

  getTipo(idOuNome: string) {
    return this.http.get<any>(`${this.apiUrl}/type/${idOuNome}`);
  }
}
