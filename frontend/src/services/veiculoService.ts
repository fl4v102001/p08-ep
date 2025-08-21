
import axios from 'axios';
import { Veiculo } from '../models/VeiculoModel';

const API_URL = '/api';

export const getVeiculos = async () => {
    const response = await axios.get<Veiculo[]>(`${API_URL}/veiculos`);
    return response.data;
};

export const createVeiculo = async (veiculoData: Partial<Veiculo>) => {
    const response = await axios.post<Veiculo>(`${API_URL}/veiculos`, veiculoData);
    return response.data;
};

export const updateVeiculo = async (id: number, veiculoData: Partial<Veiculo>) => {
    const response = await axios.put<Veiculo>(`${API_URL}/veiculos/${id}`, veiculoData);
    return response.data;
};

export const deleteVeiculo = async (id: number) => {
    const response = await axios.delete(`${API_URL}/veiculos/${id}`);
    return response.data;
};
