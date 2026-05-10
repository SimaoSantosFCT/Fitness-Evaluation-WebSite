package com.magda.model;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Representa uma avaliação guardada na base de dados.
 * Cada linha = uma avaliação de um cliente numa data específica.
 */
@Entity
@Table(name = "evaluations")
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Identificação ────────────────────────────────────────────────────────
    private String clientName;
    private LocalDate evaluationDate;
    private int age;
    private String genre;

    // ── Medidas ──────────────────────────────────────────────────────────────
    private double height;
    private double weight;
    private double fatMass;
    private double boneMass;
    private double water;
    private double muscleMass;
    private double visceralFat;
    private double basalMetabolism;
    private double metabolicAge;
    private int physicalLevel;

    // ── Calculado ────────────────────────────────────────────────────────────
    private double imc;

    public Evaluation() {}

    // ── Getters / Setters ────────────────────────────────────────────────────
    public Long getId()                         { return id; }
    public String getClientName()               { return clientName; }
    public void setClientName(String v)         { this.clientName = v; }
    public LocalDate getEvaluationDate()        { return evaluationDate; }
    public void setEvaluationDate(LocalDate v)  { this.evaluationDate = v; }
    public int getAge()                         { return age; }
    public void setAge(int v)                   { this.age = v; }
    public String getGenre()                    { return genre; }
    public void setGenre(String v)              { this.genre = v; }
    public double getHeight()                   { return height; }
    public void setHeight(double v)             { this.height = v; }
    public double getWeight()                   { return weight; }
    public void setWeight(double v)             { this.weight = v; }
    public double getFatMass()                  { return fatMass; }
    public void setFatMass(double v)            { this.fatMass = v; }
    public double getBoneMass()                 { return boneMass; }
    public void setBoneMass(double v)           { this.boneMass = v; }
    public double getWater()                    { return water; }
    public void setWater(double v)              { this.water = v; }
    public double getMuscleMass()               { return muscleMass; }
    public void setMuscleMass(double v)         { this.muscleMass = v; }
    public double getVisceralFat()              { return visceralFat; }
    public void setVisceralFat(double v)        { this.visceralFat = v; }
    public double getBasalMetabolism()          { return basalMetabolism; }
    public void setBasalMetabolism(double v)    { this.basalMetabolism = v; }
    public double getMetabolicAge()             { return metabolicAge; }
    public void setMetabolicAge(double v)       { this.metabolicAge = v; }
    public int getPhysicalLevel()               { return physicalLevel; }
    public void setPhysicalLevel(int v)         { this.physicalLevel = v; }
    public double getImc()                      { return imc; }
    public void setImc(double v)                { this.imc = v; }
}
