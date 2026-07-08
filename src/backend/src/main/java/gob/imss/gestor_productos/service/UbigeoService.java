package gob.imss.gestor_productos.service;


import gob.imss.gestor_productos.model.dto.UbigeoDto;
import gob.imss.gestor_productos.repository.UbigeoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional(readOnly = true) // Opción Senior: Optimiza las consultas SQL indicando que solo son de lectura
public class UbigeoService {

    @Autowired
    private UbigeoRepository ubigeoRepository;

    /**
     * Recupera todos los departamentos de Perú
     */
    public List<UbigeoDto> obtenerDepartamentos() {
        return ubigeoRepository.findDistinctDepartamentos();
    }

    /**
     * Recupera las provincias pertenecientes a un departamento
     * @param departamentoId Código de 2 dígitos (ej: "15")
     */
    public List<UbigeoDto> obtenerProvincias(String departamentoId) {
        return ubigeoRepository.findProvinciasByDepartamento(departamentoId);
    }

    /**
     * Recupera los distritos pertenecientes a una provincia
     * @param provinciaId Código de 4 dígitos (ej: "1501")
     */
    public List<UbigeoDto> obtenerDistritos(String provinciaId) {
        return ubigeoRepository.findDistritosByProvincia(provinciaId);
    }
}