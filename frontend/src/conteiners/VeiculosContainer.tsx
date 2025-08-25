
import React, { useState, useEffect } from 'react';
import { Veiculo } from '../models/VeiculoModel';
import VeiculoList from '../components/VeiculoList';
import VeiculoForm from '../components/VeiculoForm';
import * as veiculoService from '../services/veiculoService';

const VeiculosContainer: React.FC = () => {
    const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
    const [editingVeiculo, setEditingVeiculo] = useState<Veiculo | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    useEffect(() => {
        loadVeiculos();
    }, []);

    const loadVeiculos = async () => {
        const data = await veiculoService.getVeiculos();
        setVeiculos(data);
    };

    const handleSave = async (veiculoData: Partial<Veiculo>) => {
        if (editingVeiculo) {
            await veiculoService.updateVeiculo(editingVeiculo.id, veiculoData);
        } else {
            await veiculoService.createVeiculo(veiculoData);
        }
        loadVeiculos();
        setEditingVeiculo(null);
        setIsFormVisible(false);
    };

    const handleEdit = (veiculo: Veiculo) => {
        setEditingVeiculo(veiculo);
        setIsFormVisible(true);
    };

    const handleDelete = async (id: number) => {
        await veiculoService.deleteVeiculo(id);
        loadVeiculos();
    };

    const handleCancel = () => {
        setEditingVeiculo(null);
        setIsFormVisible(false);
    };

    return (
        <div>
            <h1>Gerenciamento de Veículos</h1>
            <button onClick={() => setIsFormVisible(true)}>Adicionar Veículo</button>
            {isFormVisible && (
                <VeiculoForm 
                    veiculoToEdit={editingVeiculo}
                    onSave={handleSave} 
                    onCancel={handleCancel} 
                />
            )}
            <VeiculoList 
                veiculos={veiculos} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
                onAdd={() => setIsFormVisible(true)}
            />
        </div>
    );
};

export default VeiculosContainer;
