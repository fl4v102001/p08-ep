
import React, { useState, useEffect } from 'react';
import { Veiculo } from '../models/VeiculoModel';

interface VeiculoFormProps {
    veiculoToEdit: Veiculo | null;
    onSave: (veiculo: Partial<Veiculo>) => void;
    onCancel: () => void;
}

const VeiculoForm: React.FC<VeiculoFormProps> = ({ veiculoToEdit, onSave, onCancel }) => {
    const [veiculo, setVeiculo] = useState<Partial<Veiculo>>({});

    useEffect(() => {
        if (veiculoToEdit) {
            setVeiculo(veiculoToEdit);
        } else {
            setVeiculo({});
        }
    }, [veiculoToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setVeiculo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(veiculo);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="placa" value={veiculo.placa || ''} onChange={handleChange} placeholder="Placa" />
            <input name="marca" value={veiculo.marca || ''} onChange={handleChange} placeholder="Marca" />
            <input name="modelo" value={veiculo.modelo || ''} onChange={handleChange} placeholder="Modelo" />
            <input name="cor" value={veiculo.cor || ''} onChange={handleChange} placeholder="Cor" />
            <input name="tipo" value={veiculo.tipo || ''} onChange={handleChange} placeholder="Tipo" />
            <button type="submit">Salvar</button>
            <button type="button" onClick={onCancel}>Cancelar</button>
        </form>
    );
};

export default VeiculoForm;
