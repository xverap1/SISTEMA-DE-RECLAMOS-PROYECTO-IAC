package gob.imss.gestor_productos.repository;

import gob.imss.gestor_productos.model.Ubigeo;
import gob.imss.gestor_productos.model.dto.UbigeoDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UbigeoRepository extends JpaRepository<Ubigeo, String> {

    // 1. Obtiene todos los departamentos únicos (Primeros 2 dígitos del código)
    @Query("SELECT DISTINCT new gob.imss.gestor_productos.model.dto.UbigeoDto(SUBSTRING(u.codigoUbigeo, 1, 2), u.departamento) FROM Ubigeo u")
    List<UbigeoDto> findDistinctDepartamentos();

    // 2. Obtiene las provincias filtradas por el código de departamento
    @Query("SELECT DISTINCT new gob.imss.gestor_productos.model.dto.UbigeoDto(SUBSTRING(u.codigoUbigeo, 1, 4), u.provincia) " +
            "FROM Ubigeo u WHERE u.codigoUbigeo LIKE :depId%")
    List<UbigeoDto> findProvinciasByDepartamento(@Param("depId") String depId);

    // 3. Obtiene los distritos filtrados por el código de provincia
    @Query("SELECT new gob.imss.gestor_productos.model.dto.UbigeoDto(u.codigoUbigeo, u.distrito) " +
            "FROM Ubigeo u WHERE u.codigoUbigeo LIKE :provId%")
    List<UbigeoDto> findDistritosByProvincia(@Param("provId") String provId);
}