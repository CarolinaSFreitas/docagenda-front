import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPacientes,
  createPaciente,
  fetchPacientePorMedico,
  createPacienteAssistente,
} from "../slices/pacienteSlice";
import { useNavigate } from "react-router-dom";
import "./PacienteList.css";
import { getUserDetails } from "../slices/userSlice";

const PacientesList = ({ isAssistente, userId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pacientes, pacientePorMedico, loading, error } = useSelector(
    (state) => state.pacientes
  );
  const { user } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    fone: "",
    endereco: "",
    prontuario: "",
    remedio: "",
    comorbidade: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAssistente && userId) {
      dispatch(fetchPacientePorMedico(userId));
      dispatch(getUserDetails(userId));
    } else {
      dispatch(fetchPacientes());
    }
  }, [dispatch, isAssistente, userId]);

  const handleBack = () => {
    if (isAssistente && userId) {
      dispatch(fetchPacientePorMedico(userId));
    } else {
      dispatch(fetchPacientes());
    }
    setSearchPerformed(false);
    setSearchTerm("");
  };

  const handleViewMore = (id) => {
    navigate(`/paciente/${id}`);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nome || formData.nome.length < 3) {
      newErrors.nome = "O nome deve ter pelo menos 3 caracteres.";
    }
    if (!formData.fone) {
      newErrors.fone = "O telefone é obrigatório.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCreatePaciente = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await dispatch(
          isAssistente
            ? createPacienteAssistente({ ...formData, medicoId: userId })
            : createPaciente(formData)
        ).unwrap();
        setShowModal(false);
        setFormData({
          nome: "",
          fone: "",
          endereco: "",
          prontuario: "",
          remedio: "",
          comorbidade: "",
        });
        if (isAssistente && userId) {
          dispatch(fetchPacientePorMedico(userId));
        } else {
          dispatch(fetchPacientes());
        }
      } catch (error) {
        setErrors({ general: error.message });
      }
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Ocorreu um erro: {error}</p>;

  const pacientesList = isAssistente ? pacientePorMedico : pacientes;

  const pacientesFiltered = pacientesList
  ?.filter((paciente) => {
    const pacienteNome = paciente?.nome?.toLowerCase() || "";
    return pacienteNome?.includes(searchTerm.toLowerCase());
  })
  .sort((a, b) => {
    if (!a.nome || !b.nome) return 0; // Verifica se o nome é undefined
    return a.nome.localeCompare(b.nome);
  });


  // ve se é um array antes de mapear
  if (!Array.isArray(pacientesList)) {
    return <p>Nenhum paciente encontrado.</p>;
  }

  return (
    <div>
      {searchPerformed && (
        <button onClick={handleBack} className="botao">
          {" "}
          <u id="btn-voltar">Limpar pesquisa</u>
        </button>
      )}
      <h1>
        {isAssistente && userId
          ? `Pacientes de ${user?.name}`
          : "Meus Pacientes"}
      </h1>
      <span className="botoes-lista">
        <div className="filtro-busca">
          <input
            type="text"
            placeholder="Buscar paciente pelo nome"
            value={searchTerm}
            className="input-busca"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => setShowModal(true)} className="btn-novo">
          Adicionar Novo Paciente
        </button>
      </span>
      <table id="lista">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Telefone</th>
            <th className="campo-btn"></th>
          </tr>
        </thead>
        <tbody>
          {pacientesFiltered?.map((paciente) => (
            <tr key={paciente._id}>
              <td>{paciente.nome}</td>
              <td>{paciente.fone}</td>
              <td>
                <button
                  onClick={() => handleViewMore(paciente._id)}
                  className="btn-ver"
                >
                  Ver Mais
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal">
          <div className="modal-paciente">
            <span className="btn-fechar" onClick={() => setShowModal(false)}>
              &times;
            </span>
            <h2>Adicionar Novo Paciente</h2>
            <form onSubmit={handleCreatePaciente}>
              <div>
                <label>Nome:</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                />
                {errors.nome && <p className="error">{errors.nome}</p>}
              </div>
              <div>
                <label>Telefone:</label>
                <input
                  type="text"
                  name="fone"
                  value={formData.fone}
                  onChange={handleChange}
                />
                {errors.fone && <p className="error">{errors.fone}</p>}
              </div>
              <div>
                <label>Endereço:</label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Medicamentos:</label>
                <input
                  type="text"
                  name="remedio"
                  value={formData.remedio}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Comorbidades/Condições Pré-Existentes:</label>
                <input
                  type="text"
                  name="comorbidade"
                  value={formData.comorbidade}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Histórico do Paciente/Prontuário:</label>
                <textarea
                  type="text"
                  name="prontuario"
                  value={formData.prontuario}
                  onChange={handleChange}
                />
              </div>
              <button type="submit" className="btn">
                Salvar
              </button>
              {errors.general && <p className="error">{errors.general}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PacientesList;
