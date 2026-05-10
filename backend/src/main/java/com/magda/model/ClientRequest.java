package com.magda.model;

import java.time.LocalDate;

/**
 * DTO recebido do frontend no POST /api/evaluate
 */
public class ClientRequest {
    private String name;
    private int age;
    private String genre;
    private double height;
    private double peso;
    private double fatMass;
    private double boneMass;
    private double water;
    private double muscleMass;
    private int physicalLevel;
    private double basalMetabolism;
    private double metabolicAge;
    private double visceralFat;
    private LocalDate evaluationDate;   // ← novo campo

    public String getName()                     { return name; }
    public void setName(String v)               { this.name = v; }
    public int getAge()                         { return age; }
    public void setAge(int v)                   { this.age = v; }
    public String getGenre()                    { return genre; }
    public void setGenre(String v)              { this.genre = v; }
    public double getHeight()                   { return height; }
    public void setHeight(double v)             { this.height = v; }
    public double getPeso()                     { return peso; }
    public void setPeso(double v)               { this.peso = v; }
    public double getFatMass()                  { return fatMass; }
    public void setFatMass(double v)            { this.fatMass = v; }
    public double getBoneMass()                 { return boneMass; }
    public void setBoneMass(double v)           { this.boneMass = v; }
    public double getWater()                    { return water; }
    public void setWater(double v)              { this.water = v; }
    public double getMuscleMass()               { return muscleMass; }
    public void setMuscleMass(double v)         { this.muscleMass = v; }
    public int getPhysicalLevel()               { return physicalLevel; }
    public void setPhysicalLevel(int v)         { this.physicalLevel = v; }
    public double getBasalMetabolism()          { return basalMetabolism; }
    public void setBasalMetabolism(double v)    { this.basalMetabolism = v; }
    public double getMetabolicAge()             { return metabolicAge; }
    public void setMetabolicAge(double v)       { this.metabolicAge = v; }
    public double getVisceralFat()              { return visceralFat; }
    public void setVisceralFat(double v)        { this.visceralFat = v; }
    public LocalDate getEvaluationDate()        { return evaluationDate; }
    public void setEvaluationDate(LocalDate v)  { this.evaluationDate = v; }

    public double getIMC() {
        if (height > 0) return peso / (height * height);
        return 0;
    }
}
